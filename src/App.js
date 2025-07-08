import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Firebase yapılandırması ve uygulama kimliği (Canvas tarafından sağlanır)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const chatMessagesEndRef = useRef(null); // Sohbet mesajlarını en alta kaydırmak için ref

    // Firebase'i başlatma ve kimlik doğrulama
    useEffect(() => {
        const initFirebase = async () => {
            try {
                const appInstance = initializeApp(firebaseConfig);
                const dbInstance = getFirestore(appInstance);
                const authInstance = getAuth(appInstance);

                setDb(dbInstance);
                setAuth(authInstance);

                onAuthStateChanged(authInstance, async (user) => {
                    if (user) {
                        setUserId(user.uid);
                        console.log("Firebase Authenticated. User ID:", user.uid);
                    } else {
                        try {
                            if (initialAuthToken) {
                                await signInWithCustomToken(authInstance, initialAuthToken);
                            } else {
                                await signInAnonymously(authInstance);
                            }
                        } catch (error) {
                            console.error("Firebase authentication failed:", error);
                        }
                    }
                    setIsAuthReady(true); // Kimlik doğrulama durumu hazır
                });

                // Eğer kimlik doğrulama henüz tamamlanmadıysa ve token varsa dene
                if (!authInstance.currentUser && initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else if (!authInstance.currentUser) {
                    await signInAnonymously(authInstance);
                }

            } catch (error) {
                console.error("Firebase initialization error:", error);
            }
        };

        initFirebase();
    }, []); // Sadece bir kez çalıştır

    // Sohbet geçmişini Firestore'dan yükle
    useEffect(() => {
        if (db && userId && isAuthReady) {
            const q = query(collection(db, `artifacts/${appId}/users/${userId}/chatMessages`), orderBy("timestamp"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const loadedMessages = [];
                let hasHistory = false;
                snapshot.forEach((doc) => {
                    hasHistory = true;
                    const data = doc.data();
                    loadedMessages.push({ text: data.user, sender: 'user' });
                    loadedMessages.push({ text: data.bot, sender: 'bot' });
                });
                setChatMessages(loadedMessages);

                // Hiç geçmiş yoksa ve ilk yükleme ise karşılama mesajlarını göster
                if (!hasHistory && chatMessages.length === 0) { // Sadece ilk yüklemede ve mesaj yoksa
                    setTimeout(() => {
                        setChatMessages(prevMessages => [
                            ...prevMessages,
                            { text: "Merhaba! Ben FizyoAsistan. İlhami Hocamızın dijital asistanıyım ve size yardımcı olmak için buradayım. Size nasıl destek olabilirim?", sender: 'bot' }
                        ]);
                    }, 500); // Küçük bir gecikme ile daha doğal başlangıç
                }
            }, (error) => {
                console.error("Error loading chat messages:", error);
            });

            return () => unsubscribe(); // Cleanup on unmount
        }
    }, [db, userId, isAuthReady, chatMessages.length]); // chatMessages.length ekledim, çünkü initialLoadComplete kaldırıldı

    // Sohbet mesajları güncellendiğinde en alta kaydır
    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    };

    const handleChatInputChange = (e) => {
        setChatInput(e.target.value);
    };

    const sendMessage = async () => {
        const userMessage = chatInput.trim();
        if (userMessage === '') return;

        // Kullanıcının mesajını hemen göster
        setChatMessages(prevMessages => [...prevMessages, { text: userMessage, sender: 'user' }]);
        setChatInput('');

        // Yüklenme mesajını göster
        setChatMessages(prevMessages => [...prevMessages, { text: "Biraz bekleyin, FizyoAsistan yanıtınızı hazırlıyor...", sender: 'bot', id: 'loading-message' }]);

        // LLM API çağrısı için prompt oluştur
        let currentChatHistory = [];
        // Sadece son 10 mesajı al (yüklenme mesajı hariç)
        const filteredMessages = chatMessages.filter(msg => msg.id !== 'loading-message');
        currentChatHistory = filteredMessages.slice(Math.max(0, filteredMessages.length - 10)).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const llmPrompt = `Sen Fizyoterapist İlhami Yavuz'un profesyonel ve özlü dijital asistanı FizyoAsistan'sın. ` +
                          `Kullanıcıya genel fizyoterapi bilgileri sağla. ` +
                          `Asla teşhis koyma veya kişiye özel tedavi önerme. ` +
                          `Her zaman, en doğru değerlendirme ve kişiye özel tedavi planı için Fizyoterapist İlhami Yavuz ile görüşmesi gerektiğini kısa ve net bir şekilde belirt. ` +
                          `İlhami Hocamızın telefon numarası: 05372751789. ` +
                          `Bu telefon numarasını, sadece kullanıcı açıkça iletişim bilgisi sorduğunda veya konuşmanın sonunda bir kereye mahsus olarak ver. ` +
                          `Diğer iletişim bilgilerini (WhatsApp, e-posta, Instagram vb.) asla verme. ` +
                          `Kullanıcının son mesajı: "${userMessage}"`;

        try {
            // API anahtarını Vercel ortam değişkeninden çekiyoruz
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("API Key not found. Please set REACT_APP_GEMINI_API_KEY in Vercel Environment Variables.");
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const payload = {
                contents: [
                    ...currentChatHistory,
                    { role: "user", parts: [{ text: llmPrompt }] }
                ]
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            // Yüklenme mesajını kaldır
            setChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== 'loading-message'));

            let botResponse = "Üzgünüm, şu an yanıt oluşturamıyorum. Lütfen daha sonra tekrar deneyin veya İlhami Hocamızla doğrudan iletişime geçin.";
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                botResponse = result.candidates[0].content.parts[0].text;
            } else {
                console.error("LLM response structure unexpected:", result);
                if (result.error && result.error.message) {
                    botResponse = `API Hatası: ${result.error.message}. Lütfen daha sonra tekrar deneyin.`;
                }
            }

            setChatMessages(prevMessages => [...prevMessages, { text: botResponse, sender: 'bot' }]);

            // Firestore'a mesajı kaydet
            if (db && userId) {
                try {
                    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatMessages`), {
                        user: userMessage,
                        bot: botResponse,
                        timestamp: serverTimestamp()
                    });
                } catch (error) {
                    console.error("Error writing message to Firestore:", error);
                }
            }
        } catch (error) {
            console.error("LLM API call failed:", error);
            // Hata durumunda da yüklenme mesajını kaldır
            setChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== 'loading-message'));
            setChatMessages(prevMessages => [...prevMessages, { text: "Bir hata oluştu, lütfen daha sonra tekrar deneyin.", sender: 'bot' }]);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Section */}
            <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center rounded-b-lg">
                <div className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Fizyoterapist İlhami Yavuz</div>
                <nav className="nav-menu flex flex-wrap justify-center gap-4 md:gap-8 text-lg font-medium">
                    <a href="#home" className="nav-link text-gray-700 hover:text-blue-500">Ana Sayfa</a>
                    <a href="#about" className="nav-link text-gray-700 hover:text-blue-500">Hakkımda</a>
                    <a href="#services" className="nav-link text-gray-700 hover:text-blue-500">Hizmetler</a>
                    <a href="#appointment" className="nav-link text-gray-700 hover:text-blue-500">Randevu Al</a>
                    <a href="#testimonials" className="nav-link text-gray-700 hover:text-blue-500">Danışan Görüşleri</a>
                    <a href="#contact" className="nav-link text-gray-700 hover:text-blue-500">İletişim</a>
                </nav>
            </header>

            {/* Hero Section */}
            <section id="home" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-16 px-6 md:px-12 flex flex-col md:flex-row items-center justify-center rounded-xl m-4 md:m-8">
                <div className="hero-content text-center md:text-left max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Hareketi Özgürleştir, Yaşam Kaliteni Artır.</h1>
                    <p className="text-xl md:text-2xl font-light mb-8">Uzman fizyoterapist olarak, çocuklardan yetişkinlere kadar bireye özel rehabilitasyon programlarıyla yanınızdayım.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <a href="#about" className="btn-primary">Hakkımda</a>
                        <a href="#services" className="btn-primary">Hizmetler</a>
                        <a href="#appointment" className="btn-primary">Randevu Al</a>
                    </div>
                </div>
                {/* İlhami Hocamın fotoğrafı */}
                <div className="hero-image md:ml-12 mt-8 md:mt-0">
                    <img src="./images/IMG-20250707-WA0011.jpg" alt="Fizyoterapist İlhami Yavuz" className="rounded-full shadow-lg w-48 h-48 md:w-64 md:h-64 object-cover mx-auto" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/256x256/cccccc/000000?text=Resim+Yok'; }} />
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 px-6 md:px-12 bg-white m-4 md:m-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
                <div className="md:w-full text-center md:text-left max-w-4xl mx-auto">
                    <h2 className="text-3xl section-title">Fizyoterapist İlhami Yavuz</h2>
                    <p className="text-lg leading-relaxed text-gray-700">
                        Fizyoterapi ve Rehabilitasyon alanında edindiğim akademik bilgi ve sahadaki deneyimimle, bireylerin yaşam kalitesini artırmak ve potansiyellerini en üst düzeye taşımak için çalışıyorum. Çalışma alanımın merkezinde; pediatrik rehabilitasyon, ortopedik problemler, duruş bozuklukları, denge-yürüyüş eğitimi ve gelişimsel gecikmelere yönelik fizyoterapi uygulamaları yer alıyor. Her bireyin ihtiyacına özel değerlendirme ve egzersiz planlaması yaparak, süreci bilimsel temelli ve fonksiyonel hedeflerle ilerletiyorum.
                    </p>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-16 px-6 md:px-12 bg-gray-50 m-4 md:m-8 rounded-xl shadow-lg">
                <h2 className="text-3xl section-title text-center">Bireye Özel Fizyoterapi Hizmetleri</h2>
                <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Pediatrik Fizyoterapi */}
                    <div className="card p-6 flex flex-col items-center text-center">
                        <img src="./images/pexels-thisisengineering-3912370.jpg" alt="Pediatrik Fizyoterapi" className="rounded-full mb-4 w-24 h-24 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Resim+Yok'; }} />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Pediatrik Fizyoterapi</h3>
                        <p className="text-gray-600">Down sendromu, serebral palsi, gelişim geriliği gibi durumlarda çocukların motor gelişimini desteklemek amacıyla oyun temelli ve bilimsel yaklaşımlarla bireysel terapi uygulamaları sunuyorum.</p>
                    </div>
                    {/* Nörolojik Rehabilitasyon */}
                    <div className="card p-6 flex flex-col items-center text-center">
                        <img src="./images/pexels-pixabay-39671.jpg" alt="Nörolojik Rehabilitasyon" className="rounded-full mb-4 w-24 h-24 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Resim+Yok'; }} />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nörolojik Rehabilitasyon</h3>
                        <p className="text-gray-600">İnme, multiple skleroz (MS), beyin travması gibi nörolojik durumlara özel hareket kabiliyeti ve fonksiyonel bağımsızlığı yeniden kazandırmayı hedefleyen egzersiz programları sunuyorum.</p>
                    </div>
                    {/* Ortopedik Rehabilitasyon */}
                    <div className="card p-6 flex flex-col items-center text-center">
                        <img src="./images/pexels-maksgelatin-6094033.jpg" alt="Ortopedik Rehabilitasyon" className="rounded-full mb-4 w-24 h-24 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Resim+Yok'; }} />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Ortopedik Rehabilitasyon</h3>
                        <p className="text-gray-600">Skolyoz, bel-boyun fıtığı, ameliyat sonrası kas iskelet sistemi problemleri ve postür bozukluklarına yönelik kişiye özel tedavi planları oluşturuyorum.</p>
                    </div>
                </div>
            </section>

            {/* Appointment Section */}
            <section id="appointment" className="py-16 px-6 md:px-12 bg-white m-4 md:m-8 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl section-title">Randevunuzu Hemen Oluşturun</h2>
                <p className="text-lg leading-relaxed text-gray-700 mb-8 max-w-3xl mx-auto">
                    Fizyoterapi sürecinize başlamak için aşağıdaki iletişim kanallarından benimle doğrudan iletişime geçebilirsiniz. Size en uygun gün ve saat için birlikte planlama yapabiliriz.
                </p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <a href="tel:05372751789" className="btn-primary flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.166.44l-1.417 2.126a6.002 6.002 0 0 1-3.094-3.094l2.126-1.417c.385-.264.55-.726.44-1.166L13.5 7.125c-.125-.501-.575-.852-1.091-.852H10.5a2.25 2.25 0 0 0-2.25 2.25v2.25M12 12l.042-.042a.75.75 0 0 1 .91-.04L15 9.75M12 12l-1.5 1.5M12 12l-.042.042a.75.75 0 0 0-.91.04L9 14.25" />
                        </svg>
                        Telefon
                    </a>
                    <a href="https://wa.me/905372751789" target="_blank" className="btn-primary flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.455.343 2.906 1.07 4.277A10.5 10.5 0 0 0 12 21c2.246 0 4.47-.63 6.38-1.873a10.5 10.5 0 0 0 1.07-4.277V8.25a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v5.26Z" />
                        </svg>
                        WhatsApp ile Hızlı Randevu
                    </a>
                </div>
                <p className="text-gray-700 mt-6 text-lg">
                    📍 Adres: Doğu Cd No.13, Yeni Mahalle, İlk Paylaşım Özel Eğitim Merkezi – Ardahan
                </p>
                <p className="text-gray-700 text-lg">
                    📧 E-posta: <a href="mailto:fztilhamiyavuz@gmail.com" className="text-blue-600 hover:underline">fztilhamiyavuz@gmail.com</a>
                </p>
                <p className="text-gray-700 text-lg">
                    📷 Instagram: <a href="https://www.instagram.com/fzt.ilhamiyavuz" target="_blank" className="text-blue-600 hover:underline">@fzt.ilhamiyavuz</a>
                </p>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 px-6 md:px-12 bg-white m-4 md:m-8 rounded-xl shadow-lg">
                <h2 className="text-3xl section-title text-center">Danışanlarımızdan Gelenler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="card p-6 testimonial-card">
                        <p className="text-gray-700 italic mb-4">“İlhami Bey, oğlumun ilk adımlarını atmasında çok büyük rol oynadı. Sabırlı ve ilgili yaklaşımı sayesinde güvenle ilerledik.”</p>
                        <p className="font-semibold text-gray-800 text-right">– A.G.</p>
                    </div>
                    <div className="card p-6 testimonial-card">
                        <p className="text-gray-700 italic mb-4">“Bel fıtığı ağrılarım yıllardır geçmiyordu. Uyguladığı egzersiz programı ve yönlendirmeleriyle ağrılarım büyük ölçüde azaldı.”</p>
                        <p className="font-semibold text-gray-800 text-right">– E.K.</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 px-6 md:px-12 bg-gray-50 m-4 md:m-8 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl section-title">Benimle İletişime Geçin</h2>
                <p className="text-lg leading-relaxed text-gray-700 mb-8 max-w-3xl mx-auto">
                    Fizyoterapi hizmetleri hakkında detaylı bilgi almak veya randevu oluşturmak için aşağıdaki iletişim kanallarından bana ulaşabilirsiniz.
                </p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <a href="tel:05372751789" className="btn-primary flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.166.44l-1.417 2.126a6.002 6.002 0 0 1-3.094-3.094l2.126-1.417c.385-.264.55-.726.44-1.166L13.5 7.125c-.125-.501-.575-.852-1.091-.852H10.5a2.25 2.25 0 0 0-2.25 2.25v2.25M12 12l.042-.042a.75.75 0 0 1 .91-.04L15 9.75M12 12l-1.5 1.5M12 12l-.042.042a.75.75 0 0 0-.91.04L9 14.25" />
                        </svg>
                        Telefon
                    </a>
                    <a href="https://wa.me/905372751789" target="_blank" className="btn-primary flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.455.343 2.906 1.07 4.277A10.5 10.5 0 0 0 12 21c2.246 0 4.47-.63 6.38-1.873a10.5 10.5 0 0 0 1.07-4.277V8.25a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v5.26Z" />
                        </svg>
                        WhatsApp ile Hızlı Randevu
                    </a>
                </div>
                <p className="text-gray-700 mt-6 text-lg">
                    📍 Adres: Doğu Cd No.13, Yeni Mahalle, İlk Paylaşım Özel Eğitim Merkezi – Ardahan
                </p>
                <p className="text-gray-700 text-lg">
                    📧 E-posta: <a href="mailto:fztilhamiyavuz@gmail.com" className="text-blue-600 hover:underline">fztilhamiyavuz@gmail.com</a>
                </p>
                <p className="text-gray-700 text-lg">
                    📷 Instagram: <a href="https://www.instagram.com/fzt.ilhamiyavuz" target="_blank" className="text-blue-600 hover:underline">@fzt.ilhamiyavuz</a>
                </p>
            </section>

            {/* Footer Section */}
            <footer className="bg-gray-800 text-white py-8 px-6 md:px-12 text-center rounded-t-lg mt-4 md:mt-8">
                <p>&copy; 2025 Fizyoterapist İlhami Yavuz. Tüm Hakları Saklıdır.</p>
            </footer>

            {/* Chatbot Bubble */}
            <div id="chat-bubble" onClick={toggleChat}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H16.5m-1.5 2.25h.75m-7.5-3.75h.75m4.5-1.5h.75M12 18a9.75 9.75 0 0 1-9.75-9.75V6.75a2.25 2.25 0 0 1 2.25-2.25h10.5a2.25 2.25 0 0 1 2.25 2.25v2.25m-4.5 0h.75M12 18a9.75 9.75 0 0 0 9.75-9.75V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v2.25m-4.5 0h.75" />
                </svg>
            </div>

            {/* Chatbot Window */}
            {isChatOpen && (
                <div id="chat-window" className="flex">
                    <div id="chat-header">
                        <span>FizyoAsistan</span>
                        <button id="close-chat-btn" onClick={toggleChat}>&times;</button>
                    </div>
                    <div id="chat-messages" className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender} max-w-[80%] p-3 rounded-xl break-words ${msg.sender === 'user' ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 self-start rounded-bl-none'}`} id={msg.id}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={chatMessagesEndRef} /> {/* Scroll to this element */}
                    </div>
                    <div id="chat-input-container" className="flex p-4 border-t border-gray-200">
                        <input
                            type="text"
                            id="chat-input"
                            placeholder="Mesajınızı yazın..."
                            className="flex-grow p-3 border border-gray-300 rounded-full mr-2 outline-none"
                            value={chatInput}
                            onChange={handleChatInputChange}
                            onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                        />
                        <button id="chat-send-btn" className="bg-blue-500 text-white border-none rounded-full w-10 h-10 flex justify-center items-center cursor-pointer transition-colors duration-300 hover:bg-blue-600" onClick={sendMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;


