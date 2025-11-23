import { useEffect, useState } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Message } from '@/types';
import { formatDate } from '@/utils/validation';

export const AdminMessagesPage = () => {
  const { messages, fetchMessages, isLoading, markAsRead, deleteMessage } = useMessageStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);
  
  // Update selectedMessage when messages list updates
  useEffect(() => {
    if (selectedMessage) {
      const updatedMessage = messages.find(m => m.id === selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      }
    }
  }, [messages, selectedMessage?.id]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      // Refresh messages list to get updated read status
      await fetchMessages(1);
      // Update selected message if it's the one being marked as read
      if (selectedMessage?.id === id) {
        const updatedMessages = useMessageStore.getState().messages;
        const updatedMessage = updatedMessages.find(m => m.id === id);
        if (updatedMessage) {
          setSelectedMessage({ ...updatedMessage, read: true });
        }
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      alert('Mesaj okundu olarak işaretlenemedi');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMessage(id);
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Mesajlar" description="Gelen mesajları yönetin" />
      <AdminLayout>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8">
          Mesajlar
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Message List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Gelen Mesajlar ({messages.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read) {
                          handleMarkAsRead(message.id);
                        }
                      }}
                      className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-primary-50 dark:bg-primary-900'
                          : message.read
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-blue-50 dark:bg-blue-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                              {message.name}
                            </h3>
                            {!message.read && (
                              <span className="bg-primary-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
                                !
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {message.subject}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                        <a
                          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 flex-shrink-0"
                          title="Yanıtla"
                        >
                          📧
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Henüz mesaj yok
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {selectedMessage ? (
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Mesaj Detayı
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {!selectedMessage.read && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 whitespace-nowrap"
                        >
                          Okundu İşaretle
                        </button>
                      )}
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}&body=${encodeURIComponent(`\n\n--- Orijinal Mesaj ---\nGönderen: ${selectedMessage.name}\nTarih: ${formatDate(selectedMessage.createdAt)}\nKonu: ${selectedMessage.subject}\n\n${selectedMessage.message}`)}`}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                      >
                        📧 Yanıtla
                      </a>
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 whitespace-nowrap"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gönderen
                      </label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 dark:text-white">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        E-posta
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <a href={`mailto:${selectedMessage.email}`} className="text-xs sm:text-sm text-primary-600 hover:underline break-all">
                          {selectedMessage.email}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMessage.email);
                            alert('E-posta adresi kopyalandı!');
                          }}
                          className="px-1.5 sm:px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0"
                          title="E-posta adresini kopyala"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Konu
                      </label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 dark:text-white break-words">{selectedMessage.subject}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mesaj
                      </label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                        {selectedMessage.message}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tarih
                      </label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 dark:text-white">
                        {formatDate(selectedMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm sm:text-base">Bir mesaj seçin</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

