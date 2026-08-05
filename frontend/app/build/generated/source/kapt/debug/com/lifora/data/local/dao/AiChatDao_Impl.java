package com.lifora.data.local.dao;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import com.lifora.data.local.entities.AiChatEntity;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import kotlin.Unit;
import kotlin.coroutines.Continuation;

@SuppressWarnings({"unchecked", "deprecation"})
public final class AiChatDao_Impl implements AiChatDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<AiChatEntity> __insertionAdapterOfAiChatEntity;

  private final SharedSQLiteStatement __preparedStmtOfClearHistory;

  public AiChatDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfAiChatEntity = new EntityInsertionAdapter<AiChatEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR ABORT INTO `ai_chat` (`id`,`userId`,`userMessage`,`aiResponse`,`timestamp`) VALUES (nullif(?, 0),?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final AiChatEntity entity) {
        statement.bindLong(1, entity.getId());
        statement.bindLong(2, entity.getUserId());
        if (entity.getUserMessage() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getUserMessage());
        }
        if (entity.getAiResponse() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getAiResponse());
        }
        statement.bindLong(5, entity.getTimestamp());
      }
    };
    this.__preparedStmtOfClearHistory = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM ai_chat WHERE userId = ?";
        return _query;
      }
    };
  }

  @Override
  public Object insertChat(final AiChatEntity chat, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfAiChatEntity.insert(chat);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object clearHistory(final int userId, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfClearHistory.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, userId);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfClearHistory.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object getChatHistory(final int userId,
      final Continuation<? super List<AiChatEntity>> $completion) {
    final String _sql = "SELECT * FROM ai_chat WHERE userId = ? ORDER BY timestamp DESC LIMIT 50";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, userId);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<List<AiChatEntity>>() {
      @Override
      @NonNull
      public List<AiChatEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfUserId = CursorUtil.getColumnIndexOrThrow(_cursor, "userId");
          final int _cursorIndexOfUserMessage = CursorUtil.getColumnIndexOrThrow(_cursor, "userMessage");
          final int _cursorIndexOfAiResponse = CursorUtil.getColumnIndexOrThrow(_cursor, "aiResponse");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final List<AiChatEntity> _result = new ArrayList<AiChatEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final AiChatEntity _item;
            final int _tmpId;
            _tmpId = _cursor.getInt(_cursorIndexOfId);
            final int _tmpUserId;
            _tmpUserId = _cursor.getInt(_cursorIndexOfUserId);
            final String _tmpUserMessage;
            if (_cursor.isNull(_cursorIndexOfUserMessage)) {
              _tmpUserMessage = null;
            } else {
              _tmpUserMessage = _cursor.getString(_cursorIndexOfUserMessage);
            }
            final String _tmpAiResponse;
            if (_cursor.isNull(_cursorIndexOfAiResponse)) {
              _tmpAiResponse = null;
            } else {
              _tmpAiResponse = _cursor.getString(_cursorIndexOfAiResponse);
            }
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            _item = new AiChatEntity(_tmpId,_tmpUserId,_tmpUserMessage,_tmpAiResponse,_tmpTimestamp);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
