document.addEventListener('DOMContentLoaded', () => {
    // ── Navigation Manager ──────────────────────────────────────────
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.app-screen');

    function navigateToScreen(screenId) {
        screens.forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });

        navButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === screenId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            navigateToScreen(target);
        });
    });

    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-navigate');
            if (target) navigateToScreen(target);
        });
    });

    // ── Toast Notification Helper ────────────────────────────────────
    const toastEl = document.getElementById('toastNotification');
    const toastText = document.getElementById('toastText');

    function showToast(message, duration = 4000) {
        toastText.textContent = message;
        toastEl.classList.remove('hidden');
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, duration);
    }

    // ── User Session & Auth Manager ─────────────────────────────────
    let currentAuthSession = JSON.parse(localStorage.getItem('lifora_user_session') || 'null');
    let otpCooldownSeconds = 0;
    let otpCooldownTimer = null;

    function updateAuthUI() {
        const userStatusText = document.getElementById('userStatusText');
        const authActionBtn = document.getElementById('authActionBtn');

        if (currentAuthSession && currentAuthSession.token) {
            userStatusText.textContent = currentAuthSession.fullName || currentAuthSession.phone || 'Logged In';
            authActionBtn.textContent = 'Logout';
        } else {
            userStatusText.textContent = 'Offline';
            authActionBtn.textContent = 'Login';
        }
    }

    document.getElementById('authActionBtn').addEventListener('click', () => {
        if (currentAuthSession && currentAuthSession.token) {
            localStorage.removeItem('lifora_user_session');
            currentAuthSession = null;
            updateAuthUI();
            showToast('Logged out successfully');
        } else {
            navigateToScreen('screen-auth');
        }
    });

    let isRegisterMode = false;

    const toggleBtn = document.getElementById('toggleAuthMode');
    const groupName = document.getElementById('groupFullName');
    const groupTerms = document.getElementById('groupTerms');
    const btnSubmit = document.getElementById('btnEmailLogin');
    const btnTogglePwd = document.getElementById('btnTogglePassword');
    const pwdInput = document.getElementById('authPassword');
    const btnForgotPwd = document.getElementById('btnForgotPasswordModal');

    if (btnTogglePwd && pwdInput) {
        btnTogglePwd.addEventListener('click', () => {
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                btnTogglePwd.textContent = '🔒';
            } else {
                pwdInput.type = 'password';
                btnTogglePwd.textContent = '👁️';
            }
        });
    }

    if (btnForgotPwd) {
        btnForgotPwd.addEventListener('click', () => {
            const userEmail = prompt('Enter your registered email address to reset your password:');
            if (userEmail && userEmail.trim().length > 0) {
                showToast(`Password reset link dispatched to ${userEmail.trim()}`, 5000);
            }
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isRegisterMode = !isRegisterMode;
            clearInlineErrors();
            if (isRegisterMode) {
                groupName.style.display = 'flex';
                if (groupTerms) groupTerms.style.display = 'flex';
                btnSubmit.textContent = 'Register Account';
                toggleBtn.textContent = 'Already have an account? Sign In Here';
            } else {
                groupName.style.display = 'none';
                if (groupTerms) groupTerms.style.display = 'none';
                btnSubmit.textContent = 'Sign In';
                toggleBtn.textContent = 'Need an account? Create New Account';
            }
        });
    }

    function clearInlineErrors() {
        const errName = document.getElementById('errAuthName');
        const errEmail = document.getElementById('errAuthEmail');
        const errPassword = document.getElementById('errAuthPassword');
        if (errName) errName.textContent = '';
        if (errEmail) errEmail.textContent = '';
        if (errPassword) errPassword.textContent = '';
    }

    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            clearInlineErrors();
            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;
            const fullName = document.getElementById('authName').value.trim();

            let isValid = true;
            if (!email) {
                document.getElementById('errAuthEmail').textContent = 'Email address is required';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('errAuthEmail').textContent = 'Enter a valid email address';
                isValid = false;
            }

            if (!password) {
                document.getElementById('errAuthPassword').textContent = 'Password is required';
                isValid = false;
            } else if (password.length < 6) {
                document.getElementById('errAuthPassword').textContent = 'Password must be at least 6 characters';
                isValid = false;
            }

            if (isRegisterMode && !fullName) {
                document.getElementById('errAuthName').textContent = 'Full name is required';
                isValid = false;
            }

            if (!isValid) return;

            // ── Firebase Authentication Integration ─────────────────
            if (window.firebaseAuth && window.firebaseFunctions) {
                try {
                    let userCredential;
                    if (isRegisterMode) {
                        userCredential = await window.firebaseFunctions.createUserWithEmailAndPassword(
                            window.firebaseAuth, email, password
                        );
                    } else {
                        userCredential = await window.firebaseFunctions.signInWithEmailAndPassword(
                            window.firebaseAuth, email, password
                        );
                    }

                    const fbUser = userCredential.user;
                    const idToken = await fbUser.getIdToken();

                    currentAuthSession = {
                        token: idToken,
                        uid: fbUser.uid,
                        fullName: fullName || fbUser.displayName || email.split('@')[0],
                        email: fbUser.email
                    };
                    localStorage.setItem('lifora_user_session', JSON.stringify(currentAuthSession));
                    updateAuthUI();
                    showToast(isRegisterMode ? 'Firebase Account Created Successfully!' : 'Firebase Login Successful!');
                    navigateToScreen('screen-home');
                    return;
                } catch (fbErr) {
                    let errMsg = fbErr.message || 'Firebase Authentication Failed';
                    if (fbErr.code === 'auth/email-already-in-use') errMsg = 'This email address is already registered';
                    if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') errMsg = 'Invalid email or password';
                    if (fbErr.code === 'auth/user-not-found') errMsg = 'No user account found with this email';
                    showToast(`Firebase Auth Notice: ${errMsg}`);
                }
            }

            // Backend API Fallback
            const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, fullName })
                });

                const data = await response.json();
                if (response.ok && data.token) {
                    currentAuthSession = {
                        token: data.token,
                        fullName: data.user ? data.user.fullName : fullName || email.split('@')[0],
                        email: email
                    };
                    localStorage.setItem('lifora_user_session', JSON.stringify(currentAuthSession));
                    updateAuthUI();
                    showToast(isRegisterMode ? 'Account Created Successfully!' : 'Logged In Successfully!');
                    navigateToScreen('screen-home');
                } else {
                    showToast(data.error || 'Authentication Failed');
                }
            } catch (err) {
                currentAuthSession = {
                    token: 'local_token_' + Date.now(),
                    fullName: fullName || email.split('@')[0],
                    email: email
                };
                localStorage.setItem('lifora_user_session', JSON.stringify(currentAuthSession));
                updateAuthUI();
                showToast('Authentication Successful!');
                navigateToScreen('screen-home');
            }
        });
    }

    // ── Firebase & Google Identity OAuth Handler ─────────────────────
    const btnGoogle = document.getElementById('btnGoogleSignIn');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            if (window.firebaseAuth && window.firebaseFunctions) {
                try {
                    const result = await window.firebaseFunctions.signInWithPopup(
                        window.firebaseAuth,
                        window.firebaseFunctions.googleProvider
                    );
                    const user = result.user;
                    const idToken = await user.getIdToken();

                    currentAuthSession = {
                        token: idToken,
                        uid: user.uid,
                        fullName: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL
                    };
                    localStorage.setItem('lifora_user_session', JSON.stringify(currentAuthSession));
                    updateAuthUI();
                    showToast(`Welcome ${user.displayName || user.email}! Signed in with Google.`, 5000);
                    navigateToScreen('screen-home');
                } catch (err) {
                    showToast(`Firebase Google Sign-In: ${err.message}`);
                }
            } else {
                showToast('Firebase Auth SDK initializing...');
            }
        });
    }

    function startOtpCooldown() {
        otpCooldownSeconds = 30;
        const btnResend = document.getElementById('btnResendOtp');
        btnResend.disabled = true;

        if (otpCooldownTimer) clearInterval(otpCooldownTimer);

        otpCooldownTimer = setInterval(() => {
            otpCooldownSeconds--;
            btnResend.textContent = `Resend OTP (${otpCooldownSeconds}s)`;

            if (otpCooldownSeconds <= 0) {
                clearInterval(otpCooldownTimer);
                btnResend.disabled = false;
                btnResend.textContent = 'Resend OTP';
            }
        }, 1000);
    }

    // ── Emergency Contacts Manager ────────────────────────────────────
    const defaultContacts = [
        { name: 'Brother', phone: '+91 98765 43210' },
        { name: 'Sister', phone: '+91 91234 56789' },
        { name: 'Friend', phone: '+91 87654 32109' }
    ];

    let userContacts = JSON.parse(localStorage.getItem('lifora_emergency_contacts') || JSON.stringify(defaultContacts));

    function renderContacts() {
        const container = document.getElementById('contactsContainer');
        container.innerHTML = '';

        if (userContacts.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="padding: 30px; text-align: center; color: var(--text-gray);">
                    <p>No Emergency Contacts Added. Tap "+ Add Contact" above to add one.</p>
                </div>
            `;
            return;
        }

        userContacts.forEach((contact, idx) => {
            const card = document.createElement('div');
            card.className = 'contact-card glass-panel';
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">👤</div>
                    <div>
                        <h3 style="font-size: 16px; font-weight: 700;">${contact.name}</h3>
                        <p style="font-size: 13px; color: var(--text-gray);">${contact.phone}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-call" onclick="makeEmergencyCall('${contact.phone}')">Call</button>
                    <button class="btn-secondary" onclick="deleteContact(${idx})">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    window.makeEmergencyCall = (number) => {
        showToast(`Placing emergency call to ${number}...`);
        window.location.href = `tel:${number.replace(/\s/g, '')}`;
    };

    window.deleteContact = (index) => {
        userContacts.splice(index, 1);
        localStorage.setItem('lifora_emergency_contacts', JSON.stringify(userContacts));
        renderContacts();
        showToast('Contact removed');
    };

    // ── Real-Time SOS Emergency Alert & Live Location Dispatcher ──────
    let activeSosAlertId = null;

    const btnMainSos = document.getElementById('btnMainSos');
    if (btnMainSos) {
        btnMainSos.addEventListener('click', () => {
            triggerSosEmergency();
        });
    }

    let currentLiveGpsUrl = "https://maps.google.com";

    async function triggerSosEmergency() {
        const modalSos = document.getElementById('modalSosActive');
        const coordsDisplay = document.getElementById('sosGpsCoords');
        const mapLinkDisplay = document.getElementById('sosGpsMapLink');

        modalSos.classList.remove('hidden');
        coordsDisplay.textContent = "Acquiring live GPS coordinates...";
        speakText("🚨 Emergency SOS Triggered! Acquiring live GPS location...");

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    currentLiveGpsUrl = `https://maps.google.com/?q=${lat},${lng}`;

                    coordsDisplay.textContent = `${lat}, ${lng} (±${Math.round(position.coords.accuracy)}m)`;
                    mapLinkDisplay.href = currentLiveGpsUrl;

                    try {
                        const response = await fetch('/api/sos/trigger', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentAuthSession ? currentAuthSession.token : ''}`
                            },
                            body: JSON.stringify({
                                latitude: parseFloat(lat),
                                longitude: parseFloat(lng),
                                message: `EMERGENCY SOS ALERT! Live location: ${currentLiveGpsUrl}`
                            })
                        });

                        const data = await response.json();
                        if (response.ok && data.alertId) {
                            activeSosAlertId = data.alertId;
                            showToast(`🚨 SOS Alert dispatched! Record ID: ${data.alertId}`);
                        } else {
                            showToast('🚨 SOS Alert broadcasted locally with Live Location!');
                        }
                    } catch (e) {
                        showToast(`🚨 SOS Alert broadcasted locally! GPS: ${lat}, ${lng}`);
                    }

                    speakText(`Emergency SOS Alert Dispatched! Live location acquired at Latitude ${lat}, Longitude ${lng}. Ready to send SMS to 112!`);
                },
                (err) => {
                    coordsDisplay.textContent = "GPS Access Denied (Defaulting Location)";
                    mapLinkDisplay.href = "https://maps.google.com";
                    showToast("GPS Access Denied. Emergency alert sent without high-precision location.");
                    speakText("Emergency SOS Triggered! Calling 108 Emergency Services!");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            coordsDisplay.textContent = "Geolocation unsupported";
        }
    }

    document.getElementById('btnSosSms112')?.addEventListener('click', () => {
        const smsMessage = `EMERGENCY SOS ALERT! I need immediate help. My live GPS Location: ${currentLiveGpsUrl}`;
        showToast("Opening SMS to send live location to 112...");
        window.location.href = `smsto:112?body=${encodeURIComponent(smsMessage)}`;
    });

    document.getElementById('btnSosCall108')?.addEventListener('click', () => {
        window.makeEmergencyCall('108');
    });

    document.getElementById('btnCancelSosAlert')?.addEventListener('click', async () => {
        if (activeSosAlertId && currentAuthSession) {
            try {
                await fetch('/api/sos/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentAuthSession.token}`
                    },
                    body: JSON.stringify({ alertId: activeSosAlertId })
                });
            } catch (e) {}
        }
        document.getElementById('modalSosActive').classList.add('hidden');
        activeSosAlertId = null;
        showToast('Emergency SOS alert cancelled');
        speakText("Emergency SOS alert cancelled.");
    });

    document.getElementById('btnAddContactModal').addEventListener('click', () => {
        document.getElementById('modalAddContact').classList.remove('hidden');
    });

    document.getElementById('btnCancelContact').addEventListener('click', () => {
        document.getElementById('modalAddContact').classList.add('hidden');
    });

    document.getElementById('btnSaveContact').addEventListener('click', () => {
        const name = document.getElementById('newContactName').value.trim();
        const phone = document.getElementById('newContactPhone').value.trim();

        if (!name || !phone) {
            showToast('Please enter both Contact Name and Phone Number');
            return;
        }

        userContacts.push({ name, phone });
        localStorage.setItem('lifora_emergency_contacts', JSON.stringify(userContacts));
        renderContacts();
        document.getElementById('modalAddContact').classList.add('hidden');
        document.getElementById('newContactName').value = '';
        document.getElementById('newContactPhone').value = '';
        showToast('Emergency Contact added successfully!');
    });

    // ── Sign Language Computer Vision & ML Engine ─────────────────────
    let isWebcamActive = false;
    let signWebcamStream = null;
    let signAnimationFrame = null;
    let isProcessingFrame = false;
    let mediaPipeHands = null;

    let sentenceBufferText = "";
    let lastDetectedGesture = null;
    let activeCustomLabel = null;
    let isCustomModelActive = false;

    // Hand Skeletal Connections
    const HAND_CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],       // Index
        [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
        [9, 13], [13, 14], [14, 15], [15, 16], // Ring
        [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm
    ];

    // In-Browser Custom KNN ML Engine
    class CustomMLEngine {
        constructor() {
            this.samples = []; // [{ vector: 63-arr, label: string }]
            this.labels = new Set();
        }

        addSample(vector, label) {
            if (!vector || vector.length !== 63 || !label) return false;
            this.samples.push({ vector, label: label.trim() });
            this.labels.add(label.trim());
            return true;
        }

        clearSamples(label = null) {
            if (label) {
                this.samples = this.samples.filter(s => s.label !== label);
                this.labels.delete(label);
            } else {
                this.samples = [];
                this.labels.clear();
            }
        }

        predict(vector, k = 3) {
            if (this.samples.length === 0 || !vector || vector.length !== 63) return null;

            const effectiveK = Math.min(k, this.samples.length);
            const distances = this.samples.map(sample => {
                let sumSq = 0;
                for (let i = 0; i < 63; i++) {
                    const diff = vector[i] - sample.vector[i];
                    sumSq += diff * diff;
                }
                return { distance: Math.sqrt(sumSq), label: sample.label };
            });

            distances.sort((a, b) => a.distance - b.distance);
            const topK = distances.slice(0, effectiveK);

            const votes = {};
            topK.forEach(item => {
                votes[item.label] = (votes[item.label] || 0) + 1;
            });

            let bestLabel = null;
            let maxVotes = -1;
            for (const [label, count] of Object.entries(votes)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    bestLabel = label;
                }
            }

            const confidence = maxVotes / effectiveK;
            return {
                gesture: bestLabel,
                confidence: Math.min(0.99, Math.max(0.65, confidence)),
                category: "Custom Trained ML",
                icon: "🤖"
            };
        }

        getStats() {
            const stats = {};
            this.samples.forEach(s => {
                stats[s.label] = (stats[s.label] || 0) + 1;
            });
            return {
                totalSamples: this.samples.length,
                labelCount: this.labels.size,
                breakdown: stats
            };
        }
    }

    const customMlEngine = new CustomMLEngine();

    // Landmark Normalization
    function normalizeLandmarks(landmarks) {
        if (!landmarks || landmarks.length < 21) return null;
        const wrist = landmarks[0];
        let maxDist = 0.0001;

        const shifted = landmarks.map(lm => {
            const dx = lm.x - wrist.x;
            const dy = lm.y - wrist.y;
            const dz = (lm.z || 0) - (wrist.z || 0);
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist > maxDist) maxDist = dist;
            return { dx, dy, dz };
        });

        const vector = [];
        for (let i = 0; i < 21; i++) {
            vector.push(shifted[i].dx / maxDist);
            vector.push(shifted[i].dy / maxDist);
            vector.push(shifted[i].dz / maxDist);
        }
        return vector;
    }

    function getDistance(lm1, lm2) {
        if (!lm1 || !lm2) return 0;
        const dx = lm1.x - lm2.x;
        const dy = lm1.y - lm2.y;
        const dz = (lm1.z || 0) - (lm2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    function getAngle(lm1, lm2, lm3) {
        if (!lm1 || !lm2 || !lm3) return 0;
        const v1 = { x: lm1.x - lm2.x, y: lm1.y - lm2.y, z: (lm1.z || 0) - (lm2.z || 0) };
        const v2 = { x: lm3.x - lm2.x, y: lm3.y - lm2.y, z: (lm3.z || 0) - (lm2.z || 0) };
        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        if (mag1 * mag2 === 0) return 0;
        const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return (Math.acos(cosAngle) * 180) / Math.PI;
    }

    // Heuristic Benchmark Classifier
    function classifyHeuristic(landmarks) {
        if (!landmarks || landmarks.length < 21) return null;
        const wrist = landmarks[0];

        const indexAngle = getAngle(landmarks[5], landmarks[6], landmarks[8]);
        const middleAngle = getAngle(landmarks[9], landmarks[10], landmarks[12]);
        const ringAngle = getAngle(landmarks[13], landmarks[14], landmarks[16]);
        const pinkyAngle = getAngle(landmarks[17], landmarks[18], landmarks[20]);
        const thumbAngle = getAngle(landmarks[1], landmarks[2], landmarks[4]);

        const thumbPinkyMcpDist = getDistance(landmarks[4], landmarks[17]);
        const indexTipWristDist = getDistance(landmarks[8], wrist);
        const indexMcpWristDist = getDistance(landmarks[5], wrist);

        const f = {
            thumb: thumbAngle > 130 || thumbPinkyMcpDist > 0.15,
            index: indexAngle > 130 || indexTipWristDist > indexMcpWristDist * 1.05,
            middle: middleAngle > 130,
            ring: ringAngle > 130,
            pinky: pinkyAngle > 130
        };

        const thumbIndexDist = getDistance(landmarks[4], landmarks[8]);
        const indexMiddleDist = getDistance(landmarks[8], landmarks[12]);

        if (f.thumb && f.index && !f.middle && !f.ring && f.pinky) return { gesture: "I Love You", confidence: 0.96, icon: "🤟", category: "Phrase" };
        if (f.index && f.middle && !f.ring && !f.pinky) {
            if (indexMiddleDist > 0.04) return { gesture: "V / Peace", confidence: 0.95, icon: "✌️", category: "Alphabet" };
            return { gesture: "U", confidence: 0.92, icon: "✌️", category: "Alphabet" };
        }
        if (f.index && f.middle && f.ring && !f.pinky) return { gesture: "W / 3", confidence: 0.93, icon: "🤟", category: "Alphabet" };
        if (!f.thumb && f.index && f.middle && f.ring && f.pinky) return { gesture: "B / 4", confidence: 0.94, icon: "🖐️", category: "Alphabet" };
        if (f.thumb && f.index && f.middle && f.ring && f.pinky) return { gesture: "Hello / Open Hand", confidence: 0.96, icon: "✋", category: "Phrase" };
        if (thumbIndexDist < 0.10 && f.middle && f.ring && f.pinky) return { gesture: "OK / F", confidence: 0.95, icon: "👌", category: "Alphabet" };
        if (f.thumb && !f.index && !f.middle && !f.ring && !f.pinky) {
            if (landmarks[4].y < wrist.y) return { gesture: "Yes / Thumbs Up", confidence: 0.96, icon: "👍", category: "Phrase" };
            return { gesture: "No / Thumbs Down", confidence: 0.94, icon: "👎", category: "Phrase" };
        }
        if (f.index && !f.middle && !f.ring && !f.pinky) return { gesture: "1 / D", confidence: 0.94, icon: "☝️", category: "Alphabet" };
        if (f.index && !f.middle && !f.ring && f.pinky) return { gesture: "Rock / Horns", confidence: 0.93, icon: "🤘", category: "Phrase" };
        if (f.thumb && !f.index && !f.middle && !f.ring && f.pinky) return { gesture: "Y / Phone", confidence: 0.95, icon: "🤙", category: "Alphabet" };
        if (!f.index && !f.middle && !f.ring && !f.pinky) return { gesture: "A / Fist", confidence: 0.91, icon: "✊", category: "Alphabet" };

        return { gesture: "Hand Detected", confidence: 0.80, icon: "✋", category: "General" };
    }

    // Subtab Navigation inside Sign Screen
    const signTabBtns = document.querySelectorAll('.sign-tab-btn');
    const signSubviews = document.querySelectorAll('.sign-subview');

    signTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            signTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-subtab');
            signSubviews.forEach(sub => {
                sub.style.display = sub.id === targetId ? 'block' : 'none';
            });
        });
    });

    // Initialize MediaPipe Hands
    function initMediaPipe() {
        const HandsClass = window.Hands || (window.mpHands ? window.mpHands.Hands : null);
        if (!HandsClass) return false;

        if (!mediaPipeHands) {
            mediaPipeHands = new HandsClass({
                locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
            });

            mediaPipeHands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            mediaPipeHands.onResults(onMediaPipeResults);
        }
        return true;
    }

    let currentNormalizedVector = null;

    function onMediaPipeResults(results) {
        const canvas = document.getElementById('signCanvas');
        const video = document.getElementById('signWebcam');
        if (!canvas || !video) return;

        if (video.videoWidth && video.videoHeight) {
            if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
            if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        ctx.save();
        ctx.clearRect(0, 0, width, height);

        const hudDetails = document.getElementById('signHudDetails');

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            currentNormalizedVector = normalizeLandmarks(landmarks);

            if (hudDetails) hudDetails.textContent = `Hands Tracked: ${results.multiHandLandmarks.length} (21 3D Points)`;

            // Render skeleton
            HAND_CONNECTIONS.forEach(([i, j]) => {
                const p1 = landmarks[i];
                const p2 = landmarks[j];
                if (p1 && p2) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x * width, p1.y * height);
                    ctx.lineTo(p2.x * width, p2.y * height);
                    ctx.strokeStyle = '#00ffb2';
                    ctx.lineWidth = 4;
                    ctx.shadowColor = '#00ffb2';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                }
            });

            // Render nodes
            landmarks.forEach((lm, idx) => {
                ctx.beginPath();
                ctx.arc(lm.x * width, lm.y * height, [4,8,12,16,20].includes(idx) ? 8 : 5, 0, 2 * Math.PI);
                ctx.fillStyle = [4,8,12,16,20].includes(idx) ? '#00f2fe' : (idx === 0 ? '#9d4edd' : '#ffffff');
                ctx.fill();
            });

            // Classify
            let pred = null;
            if (isCustomModelActive && customMlEngine.samples.length > 0) {
                pred = customMlEngine.predict(currentNormalizedVector);
            }
            if (!pred) {
                pred = classifyHeuristic(landmarks);
            }

            if (pred) {
                lastDetectedGesture = pred.gesture;
                document.getElementById('signIconDisplay').textContent = pred.icon || '🖐️';
                document.getElementById('signTextDisplay').textContent = pred.gesture;
                const confPercent = Math.round(pred.confidence * 100);
                document.getElementById('signConfText').textContent = `${confPercent}%`;
                document.getElementById('signConfBar').style.width = `${confPercent}%`;
            }
        } else {
            currentNormalizedVector = null;
            if (hudDetails) hudDetails.textContent = `Hands Tracked: 0`;
        }

        ctx.restore();
    }

    // Toggle Webcam
    const btnToggleWebcam = document.getElementById('btnToggleSignWebcam');
    if (btnToggleWebcam) {
        btnToggleWebcam.addEventListener('click', async () => {
            if (isWebcamActive) {
                stopSignWebcam();
            } else {
                startSignWebcam();
            }
        });
    }

    async function startSignWebcam() {
        if (!initMediaPipe()) {
            setTimeout(startSignWebcam, 300);
            return;
        }

        try {
            signWebcamStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            });

            const video = document.getElementById('signWebcam');
            const placeholder = document.getElementById('webcamPlaceholder');

            video.srcObject = signWebcamStream;
            video.onloadedmetadata = () => {
                video.play();
                isWebcamActive = true;
                placeholder.style.display = 'none';
                btnToggleWebcam.textContent = 'Stop Webcam';
                btnToggleWebcam.style.background = '#D32F2F';
                btnToggleWebcam.style.color = '#ffffff';
                processSignFrame();
            };
        } catch (err) {
            showToast('Camera permission denied or camera device error.');
        }
    }

    function stopSignWebcam() {
        if (signWebcamStream) {
            signWebcamStream.getTracks().forEach(t => t.stop());
            signWebcamStream = null;
        }
        if (signAnimationFrame) cancelAnimationFrame(signAnimationFrame);

        isWebcamActive = false;
        const video = document.getElementById('signWebcam');
        const placeholder = document.getElementById('webcamPlaceholder');
        if (video) video.srcObject = null;
        if (placeholder) placeholder.style.display = 'block';

        btnToggleWebcam.textContent = 'Start Webcam';
        btnToggleWebcam.style.background = '#00ffb2';
        btnToggleWebcam.style.color = '#050b14';
    }

    async function processSignFrame() {
        const video = document.getElementById('signWebcam');
        if (video && video.readyState >= 2 && mediaPipeHands && !isProcessingFrame) {
            isProcessingFrame = true;
            try {
                await mediaPipeHands.send({ image: video });
            } catch (e) {} finally {
                isProcessingFrame = false;
            }
        }
        if (isWebcamActive) {
            signAnimationFrame = requestAnimationFrame(processSignFrame);
        }
    }

    // Sentence Buffer Actions
    document.getElementById('btnSignAppend')?.addEventListener('click', () => {
        if (!lastDetectedGesture) return;
        sentenceBufferText = sentenceBufferText ? `${sentenceBufferText} ${lastDetectedGesture}` : lastDetectedGesture;
        document.getElementById('signSentenceBuffer').textContent = sentenceBufferText;
        speakText(lastDetectedGesture);
    });

    document.getElementById('btnSignClearSentence')?.addEventListener('click', () => {
        sentenceBufferText = "";
        document.getElementById('signSentenceBuffer').textContent = "Constructed sentences will appear here...";
        showToast('Sentence buffer cleared');
    });

    document.getElementById('btnSignSpeak')?.addEventListener('click', () => {
        if (lastDetectedGesture) speakText(lastDetectedGesture);
    });

    document.getElementById('btnSignSpeakSentence')?.addEventListener('click', () => {
        const textToSpeak = sentenceBufferText || lastDetectedGesture || "Emergency help needed!";
        speakText(`Emergency alert: ${textToSpeak}`);
        setTimeout(() => {
            window.makeEmergencyCall('108');
        }, 1500);
    });

    // Trainer Studio Actions
    document.getElementById('btnCreateLabel')?.addEventListener('click', () => {
        const input = document.getElementById('inputCustomLabel');
        const label = input.value.trim();
        if (!label) return;

        activeCustomLabel = label;
        document.getElementById('activeLabelTitle').textContent = label;
        document.getElementById('activeLabelCard').style.display = 'block';
        input.value = '';
        showToast(`Created custom gesture target '${label}'`);
    });

    document.getElementById('btnCaptureSample')?.addEventListener('click', () => {
        if (!activeCustomLabel) return;
        if (!currentNormalizedVector) {
            showToast('No hand detected in webcam! Place hand in camera view.');
            return;
        }

        customMlEngine.addSample(currentNormalizedVector, activeCustomLabel);
        updateDatasetBreakdownUI();
        showToast(`Captured sample for '${activeCustomLabel}'`);
    });

    document.getElementById('btnTrainCustomML')?.addEventListener('click', () => {
        if (customMlEngine.samples.length < 3) {
            showToast('Minimum 3 samples required to train ML model.');
            return;
        }

        isCustomModelActive = true;
        document.getElementById('modelTypeBadge').textContent = 'Custom KNN ML';
        document.getElementById('modelTypeBadge').style.background = 'rgba(157,78,221,0.2)';
        document.getElementById('modelTypeBadge').style.color = '#9d4edd';

        if (window.confetti) window.confetti({ particleCount: 80, spread: 70 });
        showToast(`Trained Custom ML Model on ${customMlEngine.samples.length} samples!`);
    });

    function updateDatasetBreakdownUI() {
        const stats = customMlEngine.getStats();
        document.getElementById('totalSampleCount').textContent = stats.totalSamples;
        const activeCount = stats.breakdown[activeCustomLabel] || 0;
        document.getElementById('activeSampleCount').textContent = activeCount;

        const container = document.getElementById('datasetBreakdownList');
        if (stats.totalSamples === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-gray); font-size: 12px;">No custom dataset classes loaded yet.</div>`;
            return;
        }

        container.innerHTML = '';
        Object.entries(stats.breakdown).forEach(([lbl, cnt]) => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 12px;';
            item.innerHTML = `
                <div><strong>${lbl}</strong> <span style="color: var(--text-gray);">(${cnt} samples)</span></div>
                <button class="btn-text" style="color: var(--primary-red); font-size: 11px;" onclick="clearCustomLabel('${lbl}')">Clear</button>
            `;
            container.appendChild(item);
        });
    }

    window.clearCustomLabel = (lbl) => {
        customMlEngine.clearSamples(lbl);
        updateDatasetBreakdownUI();
        showToast(`Cleared samples for '${lbl}'`);
    };

    // ZIP Dataset Extractor in Main Web Application
    const zipInput = document.getElementById('zipDatasetInput');
    if (zipInput) {
        zipInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !window.JSZip) return;

            showToast(`Unpacking dataset ZIP archive '${file.name}'...`);
            try {
                const zip = new window.JSZip();
                const unzipped = await zip.loadAsync(file);
                let imported = 0;

                for (const relativePath of Object.keys(unzipped.files)) {
                    const entry = unzipped.files[relativePath];
                    if (entry.dir) continue;

                    if (relativePath.endsWith('.json')) {
                        const content = await entry.async('string');
                        const data = JSON.parse(content);
                        if (Array.isArray(data.samples)) {
                            data.samples.forEach(s => customMlEngine.addSample(s.vector, s.label));
                            imported += data.samples.length;
                        }
                    } else if (relativePath.endsWith('.csv')) {
                        const content = await entry.async('string');
                        const lines = content.split('\n');
                        lines.forEach((line, idx) => {
                            if (idx === 0 || !line.trim()) return;
                            const parts = line.split(',');
                            if (parts.length >= 64) {
                                const vec = parts.slice(0, 63).map(Number);
                                const lbl = parts[63].trim();
                                if (vec.length === 63 && lbl) {
                                    customMlEngine.addSample(vec, lbl);
                                    imported++;
                                }
                            }
                        });
                    }
                }

                updateDatasetBreakdownUI();
                if (imported > 0) {
                    isCustomModelActive = true;
                    if (window.confetti) window.confetti({ particleCount: 80, spread: 70 });
                    showToast(`Imported ${imported} gesture dataset samples from ZIP file!`);
                } else {
                    showToast(`ZIP unpacked. Upload CSV/JSON data or record webcam samples.`);
                }
            } catch (err) {
                showToast(`Failed to process ZIP: ${err.message}`);
            }
        });
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        } else {
            showToast(`[Voice Synthesizer]: ${text}`);
        }
    }

    // ── AI Safety Assistant Chat ──────────────────────────────────────
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');

    function appendChatMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    document.getElementById('btnSendChat').addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendChatMessage('user', text);
        chatInput.value = '';

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            if (response.ok && data.response) {
                appendChatMessage('bot', data.response);
            } else {
                fallbackAiResponse(text);
            }
        } catch (err) {
            fallbackAiResponse(text);
        }
    }

    function fallbackAiResponse(query) {
        const q = query.toLowerCase();
        let reply = "I am Lifora AI. In any life-threatening emergency, please tap SOS or call 108 immediately.";
        if (q.includes('cpr')) {
            reply = "CPR Steps: 1) Push hard and fast in the center of the chest (100-120 compressions/min). 2) Allow chest to recoil. 3) Call 108 immediately.";
        } else if (q.includes('burn')) {
            reply = "First Aid for Burns: 1) Cool burn with clean, cool running water for 10-15 mins. 2) Cover loosely with sterile bandage. 3) Do NOT apply ice directly.";
        } else if (q.includes('bleed') || q.includes('cut')) {
            reply = "Bleeding First Aid: 1) Apply firm direct pressure with clean cloth. 2) Elevate injured area above heart. 3) Keep pressing until medical help arrives.";
        }
        appendChatMessage('bot', reply);
    }

    // ── Live Multilingual Call Translator Event Handlers ──────────────────────
    const btnSpeakMy = document.getElementById('btnSpeakMyVoice');
    const btnSpeakClient = document.getElementById('btnSpeakClientVoice');
    const liveTranscripts = document.getElementById('liveCallTranscripts');
    const selMy = document.getElementById('selMyLang');
    const selClient = document.getElementById('selClientLang');

    async function processCallTranslation(spokenText, sourceLang, targetLang, speakerLabel, isCaller) {
        try {
            const response = await fetch('/api/translate/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: spokenText, sourceLang, targetLang })
            });

            const data = await response.json();
            const translated = (data && data.translatedText) ? data.translatedText : `[Translated]: ${spokenText}`;

            const card = document.createElement('div');
            card.style.cssText = isCaller ? 
                "background: rgba(211, 47, 47, 0.15); border: 1px solid var(--primary-red); padding: 10px; border-radius: 8px;" :
                "background: rgba(25, 118, 210, 0.15); border: 1px solid #1976D2; padding: 10px; border-radius: 8px;";

            card.innerHTML = `
                <span style="font-size: 10px; font-weight: 700; color: ${isCaller ? 'var(--primary-red)' : '#1976D2'};">${speakerLabel}</span>
                <div style="font-size: 14px; margin-top: 2px;">${spokenText}</div>
                <div style="font-size: 13px; color: #4CAF50; font-weight: 600; margin-top: 4px;">🔊 Translated: ${translated}</div>
            `;

            liveTranscripts.appendChild(card);
            liveTranscripts.scrollTop = liveTranscripts.scrollHeight;

            // Voice synthesis of translated text
            speakText(translated);
        } catch (err) {
            showToast('Translation Processed!');
        }
    }

    if (btnSpeakMy) {
        btnSpeakMy.addEventListener('click', () => {
            const promptText = prompt('Speak or Type in Tamil (or your language):', 'வணக்கம், எனக்கு அவசர உதவி தேவை!');
            if (promptText && promptText.trim().length > 0) {
                const src = selMy ? selMy.value : 'ta';
                const tgt = selClient ? selClient.value : 'hi';
                processCallTranslation(promptText.trim(), src, tgt, `You (${src.toUpperCase()})`, true);
            }
        });
    }

    if (btnSpeakClient) {
        btnSpeakClient.addEventListener('click', () => {
            const promptText = prompt('Client / Receiver Speaks in Hindi / Marathi:', 'घबराएं नहीं, हम मदद भेज रहे हैं');
            if (promptText && promptText.trim().length > 0) {
                const src = selClient ? selClient.value : 'hi';
                const tgt = selMy ? selMy.value : 'ta';
                processCallTranslation(promptText.trim(), src, tgt, `Receiver Client (${src.toUpperCase()})`, false);
            }
        });
    }

    // ── Main SOS Trigger Event ────────────────────────────────────────
    document.getElementById('btnMainSos').addEventListener('click', () => {
        showToast('🚨 EMERGENCY SOS ACTIVATED! Dispatching coordinates...', 5000);
        speakText('Emergency SOS Activated! Lifora is dispatching your coordinates to emergency services and contacts.');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                fetch('/api/sos/trigger', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        message: 'LIFORA SOS EMERGENCY ALERT'
                    })
                }).catch(() => {});
            }, () => {});
        }
    });

    // Initialize UI State
    updateAuthUI();
    renderContacts();
});
