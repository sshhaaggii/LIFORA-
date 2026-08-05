package com.lifora.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import org.json.JSONArray
import org.json.JSONObject

data class ContactItem(val name: String, val phone: String)

class EmergencyContactRepository(context: Context) {
    private val prefs = context.getSharedPreferences("emergency_contacts_prefs", Context.MODE_PRIVATE)

    fun getContacts(): List<ContactItem> {
        val json = prefs.getString("contacts_list", null) ?: return defaultContacts()
        return try {
            val array = JSONArray(json)
            val list = mutableListOf<ContactItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(ContactItem(obj.getString("name"), obj.getString("phone")))
            }
            list
        } catch (e: Exception) {
            defaultContacts()
        }
    }

    fun saveContacts(contacts: List<ContactItem>) {
        val array = JSONArray()
        for (item in contacts) {
            val obj = JSONObject()
            obj.put("name", item.name)
            obj.put("phone", item.phone)
            array.put(obj)
        }
        prefs.edit().putString("contacts_list", array.toString()).apply()
    }

    private fun defaultContacts(): List<ContactItem> {
        return listOf(
            ContactItem("Brother", "+91 98765 43210"),
            ContactItem("Sister", "+91 91234 56789"),
            ContactItem("Friend", "+91 87654 32109")
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmergencyContactsScreen(navController: NavHostController) {
    val context = LocalContext.current
    val repository = remember { EmergencyContactRepository(context) }
    val contactsList = remember { mutableStateListOf<ContactItem>().apply { addAll(repository.getContacts()) } }

    var showAddDialog by remember { mutableStateOf(false) }
    var newContactName by remember { mutableStateOf("") }
    var newContactPhone by remember { mutableStateOf("") }

    var pendingNumberToCall by remember { mutableStateOf<String?>(null) }

    val callPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { _ ->
        pendingNumberToCall?.let { number ->
            makeEmergencyCall(context, number)
            pendingNumberToCall = null
        }
    }

    val onMakeCall: (String) -> Unit = { number ->
        val hasPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED

        if (hasPermission) {
            makeEmergencyCall(context, number)
        } else {
            pendingNumberToCall = number
            callPermissionLauncher.launch(Manifest.permission.CALL_PHONE)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Emergency Contacts", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )
        },
        containerColor = Color.Black
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            if (contactsList.isEmpty()) {
                Box(
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Contacts, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(64.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("No Emergency Contacts Added", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Tap 'Add Contact' below to add a new contact.", color = Color.Gray, fontSize = 14.sp)
                    }
                }
            } else {
                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(contactsList, key = { it.name + it.phone }) { contact ->
                        ContactCard(
                            contact = contact,
                            onCallClick = { onMakeCall(contact.phone) },
                            onDeleteClick = {
                                contactsList.remove(contact)
                                repository.saveContacts(contactsList)
                                Toast.makeText(context, "Contact removed", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {
                    newContactName = ""
                    newContactPhone = ""
                    showAddDialog = true
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Add Contact", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }

        // Add Contact Dialog
        if (showAddDialog) {
            AlertDialog(
                onDismissRequest = { showAddDialog = false },
                containerColor = Color(0xFF1E1E1E),
                title = {
                    Text("Add Emergency Contact", color = Color.White, fontWeight = FontWeight.Bold)
                },
                text = {
                    Column {
                        OutlinedTextField(
                            value = newContactName,
                            onValueChange = { newContactName = it },
                            label = { Text("Contact Name", color = Color.Gray) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = Color.Red,
                                unfocusedBorderColor = Color.DarkGray
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = newContactPhone,
                            onValueChange = { newContactPhone = it },
                            label = { Text("Phone Number", color = Color.Gray) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = Color.Red,
                                unfocusedBorderColor = Color.DarkGray
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val trimmedName = newContactName.trim()
                            val trimmedPhone = newContactPhone.trim()
                            if (trimmedName.isEmpty()) {
                                Toast.makeText(context, "Please enter a contact name", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            if (trimmedPhone.isEmpty()) {
                                Toast.makeText(context, "Please enter a phone number", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            val newContact = ContactItem(trimmedName, trimmedPhone)
                            contactsList.add(newContact)
                            repository.saveContacts(contactsList)
                            showAddDialog = false
                            Toast.makeText(context, "Contact added successfully", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                    ) {
                        Text("Save", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddDialog = false }) {
                        Text("Cancel", color = Color.Gray)
                    }
                }
            )
        }
    }
}

@Composable
fun ContactCard(contact: ContactItem, onCallClick: () -> Unit, onDeleteClick: () -> Unit) {
    val context = LocalContext.current
    val cleanPhone = contact.phone.replace("\\s".toRegex(), "")

    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(45.dp).background(Color(0xFF2C2C2C), CircleShape), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Person, contentDescription = null, tint = Color.Gray)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = contact.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(text = contact.phone, fontSize = 14.sp, color = Color.Gray)
            }
            IconButton(onClick = { onCallClick() }) {
                Icon(Icons.Default.Call, contentDescription = "Call", tint = Color.Red)
            }
            IconButton(onClick = {
                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:$cleanPhone")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                try {
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(context, "Unable to open SMS app", Toast.LENGTH_SHORT).show()
                }
            }) {
                Icon(Icons.AutoMirrored.Filled.Message, contentDescription = "SMS", tint = Color.Gray)
            }
            IconButton(onClick = { onDeleteClick() }) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Gray)
            }
        }
    }
}
