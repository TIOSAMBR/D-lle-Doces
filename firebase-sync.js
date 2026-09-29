/* =========================================================
   FIREBASE — DÉLLE DOCES
   Authentication + Firestore + sincronização em tempo real
========================================================= */

(function () {
    const COLLECTION = 'usuarios';
    const DOCUMENT = 'delleDoces';
    const DATA_DOCUMENT = 'dados';
    const OWNER_KEY = 'delleDocesFirebaseOwner';

    let unsubscribe = null;
    let remoteReady = false;
    let syncing = false;

    function setStatus(text, type) {
        const el = document.getElementById('cloudStatus');
        if (!el) return;
        el.textContent = text;
        el.className = 'cloud-status ' + (type || '');
    }

    function setMessage(text, type) {
        ['cloudMessage', 'cloudAccountMessage'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = text || '';
            el.className = 'cloud-message ' + (type || '');
        });
    }

    function showLogin(show) {
        const gate = document.getElementById('authGate');
        const app = document.querySelector('.app');
        const account = document.getElementById('cloudAccount');

        if (gate) gate.hidden = !show;
        if (app) app.classList.toggle('authenticated', !show);
        if (account) account.hidden = show;

        document.body.classList.toggle('logged-in', !show);
    }

    function getConfig() {
        return window.DELLE_FIREBASE_CONFIG || {};
    }

    function validConfig() {
        const c = getConfig();
        return c.apiKey && !c.apiKey.includes('COLE_') &&
            c.projectId && !c.projectId.includes('SEU_') &&
            c.appId && !c.appId.includes('SEU_');
    }

    function dataRef() {
        const uid = firebase.auth().currentUser.uid;
        return firebase.firestore()
            .collection(COLLECTION)
            .doc(uid)
            .collection(DOCUMENT)
            .doc(DATA_DOCUMENT);
    }

    function updateAccountUI(user) {
        const email = document.getElementById('cloudEmail');
        if (email) email.textContent = user ? user.email : '';
        showLogin(!user);
    }

    function normalizeData(data) {
        return {
            products: Array.isArray(data.products) ? data.products : [],
            sales: Array.isArray(data.sales) ? data.sales : [],
            expenses: Array.isArray(data.expenses) ? data.expenses : []
        };
    }

    function sameData(a, b) {
        try {
            return JSON.stringify(normalizeData(a)) === JSON.stringify(normalizeData(b));
        } catch (e) {
            return false;
        }
    }

    async function uploadCurrentData() {
        if (!firebase.auth().currentUser || !window.db) return;

        syncing = true;
        setStatus('☁️ Sincronizando...', 'sync');

        try {
            await dataRef().set({
                ...normalizeData(window.db),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            remoteReady = true;
            setStatus('☁️ Sincronizado', 'ok');
            setMessage('Dados salvos na nuvem.', 'success');
        } catch (error) {
            console.error('Firebase upload:', error);
            setStatus('⚠️ Erro ao sincronizar', 'erro');
            setMessage('Não foi possível sincronizar. Verifique sua conexão.', 'error');
        } finally {
            syncing = false;
        }
    }

    function startRealtimeListener(user) {
        if (unsubscribe) unsubscribe();
        remoteReady = false;
        setStatus('☁️ Carregando...', 'sync');

        unsubscribe = dataRef().onSnapshot(async snapshot => {
            try {
                if (snapshot.exists) {
                    const remoteData = normalizeData(snapshot.data());
                    localStorage.setItem(OWNER_KEY, user.uid);

                    if (!sameData(window.db, remoteData)) {
                        window.replaceDelleDb(remoteData);
                        localStorage.setItem(window.DELLE_DB_KEY, JSON.stringify(window.db));
                        if (typeof window.render === 'function') window.render();
                    }

                    remoteReady = true;
                    setStatus('☁️ Sincronizado', 'ok');
                    setMessage('Atualização em tempo real ativada.', 'success');
                } else {
                    // Se já existe outro dono neste aparelho, não reutiliza os dados da conta anterior.
                    const ownerUid = localStorage.getItem(OWNER_KEY);

                    if (ownerUid && ownerUid !== user.uid) {
                        window.replaceDelleDb(window.createDefaultDelleDb());
                        localStorage.setItem(window.DELLE_DB_KEY, JSON.stringify(window.db));
                        if (typeof window.render === 'function') window.render();
                    }

                    localStorage.setItem(OWNER_KEY, user.uid);
                    await uploadCurrentData();
                }
            } catch (error) {
                console.error('Firebase realtime:', error);
                setStatus('⚠️ Erro ao sincronizar', 'erro');
                setMessage('Não foi possível carregar os dados da nuvem.', 'error');
            }
        }, error => {
            console.error('Firebase listener:', error);
            setStatus('⚠️ Erro ao sincronizar', 'erro');
            setMessage('Acesso ao banco negado ou conexão indisponível.', 'error');
        });
    }

    async function login() {
        const email = document.getElementById('cloudLoginEmail').value.trim();
        const password = document.getElementById('cloudLoginPassword').value;

        if (!email || !password) {
            setMessage('Informe seu e-mail e sua senha.', 'error');
            return;
        }

        try {
            setStatus('🔐 Entrando...', 'sync');
            setMessage('');
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Firebase login:', error);
            setStatus('🔐 Login', '');
            const messages = {
                'auth/invalid-credential': 'E-mail ou senha incorretos.',
                'auth/user-not-found': 'Usuário não encontrado.',
                'auth/wrong-password': 'Senha incorreta.',
                'auth/invalid-email': 'E-mail inválido.',
                'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco.'
            };
            setMessage(messages[error.code] || 'Não foi possível entrar.', 'error');
        }
    }

    async function logout() {
        try {
            if (unsubscribe) unsubscribe();
            unsubscribe = null;
            await firebase.auth().signOut();
        } catch (error) {
            console.error('Firebase logout:', error);
        }
    }

    async function manualSync() {
        if (!firebase.auth().currentUser) {
            setMessage('Faça login para sincronizar.', 'error');
            return;
        }
        await uploadCurrentData();
    }

    function init() {
        if (!validConfig()) {
            setStatus('⚙️ Configurar Firebase', '');
            setMessage('Preencha o firebase-config.js com os dados do seu projeto Firebase.', 'error');
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(getConfig());
        }

        const auth = firebase.auth();

        auth.onAuthStateChanged(user => {
            updateAccountUI(user);

            if (user) {
                startRealtimeListener(user);
            } else {
                if (unsubscribe) unsubscribe();
                unsubscribe = null;
                remoteReady = false;
                setStatus('🔐 Não conectado', '');
                setMessage('Entre para sincronizar seus dados na nuvem.', '');
            }
        });

        const loginButton = document.getElementById('cloudLoginButton');
        if (loginButton) loginButton.addEventListener('click', login);

        const logoutButton = document.getElementById('cloudLogoutButton');
        if (logoutButton) logoutButton.addEventListener('click', logout);

        const syncButton = document.getElementById('cloudSyncButton');
        if (syncButton) syncButton.addEventListener('click', manualSync);

        const password = document.getElementById('cloudLoginPassword');
        if (password) {
            password.addEventListener('keydown', e => {
                if (e.key === 'Enter') login();
            });
        }
    }

    window.DelleFirebase = {
        init,
        sync: manualSync,
        login,
        logout,
        uploadCurrentData,
        isReady: () => remoteReady && !!firebase.auth().currentUser,
        isSyncing: () => syncing
    };
})();
