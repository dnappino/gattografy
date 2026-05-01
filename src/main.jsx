import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DivIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import {
  Bell,
  Camera,
  Cat,
  ChevronDown,
  CircleHelp,
  Clock3,
  Eye,
  HeartHandshake,
  Home,
  ImagePlus,
  Layers,
  Map,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  PawPrint,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import catOne from "./assets/cat-1.jpg";
import catTwo from "./assets/cat-2.jpg";
import catThree from "./assets/cat-3.jpg";
import catFour from "./assets/cat-4.jpg";
import catFive from "./assets/cat-5.jpg";
import catSix from "./assets/cat-6.jpg";
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase";

const catPhotos = [
  catOne,
  catTwo,
  catThree,
  catFour,
  catFive,
  catSix,
];

const seedColonies = [
  {
    id: 1,
    name: "Giardini di Via Padova",
    zone: "Via Padova, 96 - Milano",
    caretaker: "Laura B.",
    admin: "Sara",
    collaborators: ["Laura B.", "Marco T."],
    aslDeclared: true,
    status: "Attiva",
    cats: 18,
    kittens: 3,
    updated: "oggi",
    x: 43,
    y: 36,
    lat: 45.4962,
    lng: 9.2235,
    priority: "rescue",
    photos: [catPhotos[0], catPhotos[1], catPhotos[2], catPhotos[3]],
  },
  {
    id: 2,
    name: "Cortile di Via Prina",
    zone: "Via Prina, 15 - Milano",
    caretaker: "Marco T.",
    admin: "Marco T.",
    collaborators: ["Sara"],
    aslDeclared: false,
    status: "Attiva",
    cats: 12,
    kittens: 1,
    updated: "ieri",
    x: 72,
    y: 56,
    lat: 45.4831,
    lng: 9.1818,
    photos: [catPhotos[2], catPhotos[4], catPhotos[1]],
  },
  {
    id: 3,
    name: "Parco Trotter",
    zone: "Via Giacosa, 46 - Milano",
    caretaker: "Elisa R.",
    admin: "Elisa R.",
    collaborators: ["Laura B."],
    aslDeclared: true,
    status: "Monitoraggio",
    cats: 9,
    kittens: 0,
    updated: "2 giorni fa",
    x: 30,
    y: 42,
    lat: 45.4947,
    lng: 9.2224,
    photos: [catPhotos[5], catPhotos[0]],
  },
  {
    id: 4,
    name: "Area Ferrovia Lambrate",
    zone: "Via Conte Rosso - Milano",
    caretaker: "Gruppo Lambrate",
    admin: "Gruppo Lambrate",
    collaborators: ["Sara", "Elisa R."],
    aslDeclared: false,
    status: "Monitoraggio",
    cats: 7,
    kittens: 0,
    updated: "3 giorni fa",
    x: 62,
    y: 28,
    lat: 45.4838,
    lng: 9.2375,
    photos: [catPhotos[3], catPhotos[2]],
  },
  {
    id: 5,
    name: "Orto di via San Faustino",
    zone: "Via San Faustino, 8 - Milano",
    caretaker: "Paola C.",
    admin: "Paola C.",
    collaborators: [],
    aslDeclared: false,
    status: "Sospesa",
    cats: 5,
    kittens: 0,
    updated: "1 settimana fa",
    x: 23,
    y: 62,
    lat: 45.4779,
    lng: 9.2388,
    photos: [catPhotos[4], catPhotos[5]],
  },
  {
    id: 6,
    name: "Angiporto dei Caserti",
    zone: "Via Angiporto dei Caserti - Napoli",
    caretaker: "ilaria_nappino",
    admin: "ilaria_nappino",
    collaborators: [],
    aslDeclared: false,
    status: "Test",
    cats: 0,
    kittens: 0,
    updated: "adesso",
    x: 52,
    y: 68,
    lat: 40.8504,
    lng: 14.2656,
    photos: [catPhotos[5]],
  },
];

const cats = [
  { name: "Micio", sex: "Maschio", note: "Sterilizzato", photo: catPhotos[0] },
  { name: "Luna", sex: "Femmina", note: "Sterilizzata", photo: catPhotos[1] },
  { name: "Tigro", sex: "Maschio", note: "Sterilizzato", photo: catPhotos[2] },
  { name: "Nina", sex: "Femmina", note: "Sterilizzata", photo: catPhotos[3] },
  { name: "Dea", sex: "Femmina", note: "Da verificare", photo: catPhotos[4] },
];

const seedUsers = [
  {
    username: "Sara",
    email: "sara@gattografy.test",
    avatar: catFive,
    role: "amministratrice sito",
    passwordPolicy: "utente demo locale",
  },
  {
    username: "ilaria_nappino",
    email: "ilynap@gmail.com",
    avatar: catThree,
    role: "amministratrice colonia",
    passwordPolicy: "password da impostare nel backend, non salvata nel frontend",
  },
];

const seedParticipationRequests = [
  {
    id: 1,
    colonyId: 1,
    user: "Giulia N.",
    message: "Vorrei aiutare ad aggiornare foto e avvistamenti del sabato.",
    status: "In attesa",
  },
  {
    id: 2,
    colonyId: 1,
    user: "Dario P.",
    message: "Sono vicino alla zona e posso controllare le ciotole.",
    status: "In attesa",
  },
  {
    id: 3,
    colonyId: 3,
    user: "Sara",
    message: "Posso dare una mano con il censimento dei nuovi arrivi.",
    status: "In attesa",
  },
];

const seedFriendRequests = [
  { id: 1, user: "Giulia N.", note: "Volontaria zona nord", accepted: false },
  { id: 2, user: "Dario P.", note: "Disponibile per recuperi serali", accepted: false },
];

const seedMessages = [
  {
    id: 1,
    from: "Laura B.",
    text: "Ho caricato le foto nuove della colonia. Possiamo verificare il gatto rosso?",
    time: "09:24",
  },
  {
    id: 2,
    from: "Sara",
    text: "Si, preparo una segnalazione e controllo se è già in un'altra colonia.",
    time: "09:31",
  },
];

const navItems = [
  ["Mappa", Map],
  ["Colonie", Cat],
  ["Gatti", PawPrint],
  ["Segnalazioni", Megaphone],
  ["Messaggi", MessageCircle],
  ["Community", Users],
];

const utilityItems = [
  ["I miei preferiti", Star],
  ["Le mie attività", Clock3],
  ["Documenti e guide", Layers],
  ["Statistiche", Home],
  ["Impostazioni", Settings],
];

const selectedMarkerIcon = new DivIcon({
  className: "leaflet-cat-marker selected",
  html: '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-5.1 7-12a7 7 0 0 0-14 0c0 6.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.8"/></svg></span>',
  iconSize: [48, 48],
  iconAnchor: [24, 44],
  popupAnchor: [0, -38],
});

const colonyMarkerIcon = new DivIcon({
  className: "leaflet-cat-marker",
  html: '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-5.1 7-12a7 7 0 0 0-14 0c0 6.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.8"/></svg></span>',
  iconSize: [40, 40],
  iconAnchor: [20, 36],
  popupAnchor: [0, -32],
});

function MapFlyTo({ selected }) {
  const map = useMap();

  React.useEffect(() => {
    map.flyTo([selected.lat, selected.lng], 15, { duration: 0.75 });
  }, [map, selected.lat, selected.lng]);

  return null;
}

function mapDbColony(row, index = 0) {
  const city = row.city ? ` - ${row.city}` : "";

  return {
    id: row.id,
    name: row.name,
    zone: `${row.address}${city}`,
    caretaker: row.admin_username ?? "Amministratore colonia",
    admin: row.admin_username ?? "Amministratore colonia",
    collaborators: [],
    aslDeclared: row.asl_declared,
    status: row.status,
    cats: row.cat_count ?? 0,
    kittens: 0,
    updated: "da DB",
    lat: row.lat,
    lng: row.lng,
    photos: [catPhotos[index % catPhotos.length]],
  };
}

function App() {
  const [currentUser, setCurrentUser] = useState(seedUsers[0]);
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState({
    username: "ilaria_nappino",
    email: "ilynap@gmail.com",
    password: "",
  });
  const [authStatus, setAuthStatus] = useState("");
  const [isAuthBusy, setAuthBusy] = useState(false);
  const [colonies, setColonies] = useState(seedColonies);
  const [dataStatus, setDataStatus] = useState("Dati demo in memoria.");
  const [isDataBusy, setDataBusy] = useState(false);
  const [selectedId, setSelectedId] = useState(6);
  const [activeSection, setActiveSection] = useState("Mappa");
  const [isRegisterOpen, setRegisterOpen] = useState(true);
  const [comments, setComments] = useState([
    "Avvistati 2 nuovi gatti nella zona nord della colonia. Sto verificando se sono già censiti.",
  ]);
  const [draft, setDraft] = useState("");
  const [participationRequests, setParticipationRequests] = useState(seedParticipationRequests);
  const [friendRequests, setFriendRequests] = useState(seedFriendRequests);
  const [messages, setMessages] = useState(seedMessages);
  const [messageDraft, setMessageDraft] = useState("");
  const selected = useMemo(
    () => colonies.find((colony) => colony.id === selectedId) ?? colonies[0],
    [colonies, selectedId],
  );

  useEffect(() => {
    let unsubscribe = null;

    async function loadSession() {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setAuthStatus("Modalità demo: collega Supabase per login e registrazione reali.");
        setDataStatus("Dati demo in memoria. Collega Supabase per persistenza reale.");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await hydrateSupabaseUser(data.session.user);
        setRegisterOpen(false);
      }
      await loadColoniesFromSupabase(supabase);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          hydrateSupabaseUser(session.user);
          setRegisterOpen(false);
        } else {
          setCurrentUser(seedUsers[0]);
        }
      });
      unsubscribe = listener.subscription.unsubscribe;
    }

    loadSession();
    return () => unsubscribe?.();
  }, []);

  async function hydrateSupabaseUser(user) {
    const supabase = await getSupabaseClient();
    const metadata = user.user_metadata ?? {};

    if (!supabase) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username,email,avatar_url,role")
      .eq("id", user.id)
      .maybeSingle();

    setCurrentUser({
      id: user.id,
      username: profile?.username ?? metadata.username ?? user.email,
      email: profile?.email ?? user.email,
      avatar: profile?.avatar_url || catFive,
      role: profile?.role ?? "user",
    });
  }

  async function loadColoniesFromSupabase(existingClient) {
    const supabase = existingClient ?? (await getSupabaseClient());
    if (!supabase) return;

    setDataBusy(true);
    try {
      const { data, error } = await supabase
        .from("colonies")
        .select("id,name,address,city,lat,lng,status,asl_declared,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data?.length) {
        setDataStatus("Supabase collegato, ma non ci sono ancora colonie nel DB.");
        return;
      }

      const mapped = data.map(mapDbColony);
      setColonies(mapped);
      setSelectedId(mapped[0].id);
      setDataStatus(`Caricate ${mapped.length} colonie da Supabase.`);
    } catch (error) {
      setDataStatus(`Errore lettura Supabase: ${error.message}`);
    } finally {
      setDataBusy(false);
    }
  }

  async function createColony(newColony) {
    const parsedLat = Number(newColony.lat);
    const parsedLng = Number(newColony.lng);
    const colonyName = newColony.name.trim();
    const address = newColony.address.trim();
    const city = newColony.city.trim();

    if (!colonyName || !address || !city || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setDataStatus("Compila nome, indirizzo, città, latitudine e longitudine.");
      return false;
    }

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser.id) {
      const demoColony = {
        id: Date.now(),
        name: colonyName,
        zone: `${address} - ${city}`,
        caretaker: currentUser.username,
        admin: currentUser.username,
        collaborators: [],
        aslDeclared: newColony.aslDeclared,
        status: "Attiva",
        cats: 0,
        kittens: 0,
        updated: "adesso",
        lat: parsedLat,
        lng: parsedLng,
        photos: [currentUser.avatar || catPhotos[0]],
      };
      setColonies((items) => [demoColony, ...items]);
      setSelectedId(demoColony.id);
      setDataStatus("Colonia creata solo in demo. Configura Supabase per salvarla nel DB.");
      return true;
    }

    setDataBusy(true);
    try {
      const { data, error } = await supabase
        .from("colonies")
        .insert({
          name: colonyName,
          address,
          city,
          lat: parsedLat,
          lng: parsedLng,
          status: "Attiva",
          asl_declared: newColony.aslDeclared,
          created_by: currentUser.id,
          colony_admin_id: currentUser.id,
        })
        .select("id,name,address,city,lat,lng,status,asl_declared,created_at")
        .single();

      if (error) throw error;

      const mapped = mapDbColony(data);
      setColonies((items) => [mapped, ...items]);
      setSelectedId(mapped.id);
      setDataStatus(`Colonia "${mapped.name}" salvata su Supabase.`);
      return true;
    } catch (error) {
      setDataStatus(`Errore creazione colonia: ${error.message}`);
      return false;
    } finally {
      setDataBusy(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthStatus("");

    try {
      if (!authForm.email || !authForm.password || (authMode === "register" && !authForm.username)) {
        setAuthStatus("Compila email, password e nome utente.");
        return;
      }

      const supabase = await getSupabaseClient();
      if (!supabase) {
        const demoUser =
          seedUsers.find((user) => user.email === authForm.email || user.username === authForm.username) ??
          {
            username: authForm.username || authForm.email.split("@")[0],
            email: authForm.email,
            avatar: catThree,
            role: "utente demo",
          };
        setCurrentUser(demoUser);
        setRegisterOpen(false);
        setAuthStatus("Accesso demo completato. Configura Supabase per persistenza reale.");
        return;
      }

      if (authMode === "register") {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: {
              username: authForm.username,
              avatar_url: "",
            },
          },
        });
        if (error) throw error;
        setAuthStatus("Account creato. Se Supabase richiede conferma email, controlla la posta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
        setAuthStatus("Accesso completato.");
      }
    } catch (error) {
      setAuthStatus(error.message ?? "Errore autenticazione.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    const supabase = await getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setCurrentUser(seedUsers[0]);
    setRegisterOpen(true);
    setAuthMode("login");
    setAuthStatus("Sessione chiusa.");
  }

  function addCat() {
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, cats: item.cats + 1, updated: "adesso" }
          : item,
      ),
    );
  }

  function reportKitten() {
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, kittens: item.kittens + 1, status: "Attiva", updated: "adesso" }
          : item,
      ),
    );
  }

  function addComment() {
    if (!draft.trim()) return;
    setComments((items) => [draft.trim(), ...items]);
    setDraft("");
  }

  function toggleAslDeclared() {
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, aslDeclared: !item.aslDeclared, updated: "adesso" }
          : item,
      ),
    );
  }

  function replaceColonyAdmin(nextAdmin) {
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              admin: nextAdmin,
              collaborators: item.collaborators.includes(nextAdmin)
                ? item.collaborators
                : [...item.collaborators, nextAdmin],
              updated: "adesso",
            }
          : item,
      ),
    );
  }

  function approveParticipation(requestId) {
    const request = participationRequests.find((item) => item.id === requestId);
    if (!request) return;

    setColonies((items) =>
      items.map((item) =>
        item.id === request.colonyId && !item.collaborators.includes(request.user)
          ? {
              ...item,
              collaborators: [...item.collaborators, request.user],
              updated: "adesso",
            }
          : item,
      ),
    );
    setParticipationRequests((items) =>
      items.map((item) =>
        item.id === requestId ? { ...item, status: "Approvata" } : item,
      ),
    );
  }

  function acceptFriend(requestId) {
    setFriendRequests((items) =>
      items.map((item) =>
        item.id === requestId ? { ...item, accepted: true } : item,
      ),
    );
  }

  function sendMessage() {
    if (!messageDraft.trim()) return;
    setMessages((items) => [
      ...items,
      {
        id: Date.now(),
        from: "Sara",
        text: messageDraft.trim(),
        time: "adesso",
      },
    ]);
    setMessageDraft("");
  }

  return (
    <main className="app-shell">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <section className="workspace">
        <Topbar
          currentUser={currentUser}
          onOpenAuth={() => setRegisterOpen(true)}
          onLogout={signOut}
        />
        {activeSection === "Mappa" && (
          <MapSection
            colonies={colonies}
            selected={selected}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddCat={addCat}
            onReportKitten={reportKitten}
            comments={comments}
            draft={draft}
            setDraft={setDraft}
            addComment={addComment}
            participationRequests={participationRequests.filter(
              (request) => request.colonyId === selected.id,
            )}
            friendRequests={friendRequests}
            messages={messages}
            messageDraft={messageDraft}
            setMessageDraft={setMessageDraft}
            onToggleAsl={toggleAslDeclared}
            onReplaceAdmin={replaceColonyAdmin}
            onApproveParticipation={approveParticipation}
            onAcceptFriend={acceptFriend}
            onSendMessage={sendMessage}
          />
        )}
        {activeSection === "Colonie" && (
          <ColoniesSection
            colonies={colonies}
            selectedId={selectedId}
            dataStatus={dataStatus}
            isDataBusy={isDataBusy}
            onSelect={(id) => {
              setSelectedId(id);
              setActiveSection("Mappa");
            }}
            onCreateColony={createColony}
          />
        )}
        {activeSection === "Gatti" && <CatsSection colonies={colonies} />}
        {activeSection === "Segnalazioni" && <ReportsSection colonies={colonies} />}
        {activeSection === "Messaggi" && (
          <MessagesSection
            friendRequests={friendRequests}
            messages={messages}
            messageDraft={messageDraft}
            setMessageDraft={setMessageDraft}
            onAcceptFriend={acceptFriend}
            onSendMessage={sendMessage}
          />
        )}
        {activeSection === "Community" && (
          <CommunitySection
            colonies={colonies}
            participationRequests={participationRequests}
            friendRequests={friendRequests}
            onApproveParticipation={approveParticipation}
            onAcceptFriend={acceptFriend}
          />
        )}
      </section>
      <MobilePreview selected={selected} onAddCat={addCat} onReportKitten={reportKitten} />
      {isRegisterOpen && (
        <RegisterModal
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          authStatus={authStatus}
          isAuthBusy={isAuthBusy}
          onSubmit={handleAuthSubmit}
          onClose={() => setRegisterOpen(false)}
        />
      )}
    </main>
  );
}

function Sidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Cat size={28} />
        <span>gattografy</span>
      </div>
      <nav className="nav-group" aria-label="Navigazione principale">
        {navItems.map(([label, Icon]) => (
          <button
            className={label === activeSection ? "nav-item active" : "nav-item"}
            key={label}
            onClick={() => onSectionChange(label)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {label === "Segnalazioni" && <strong>8</strong>}
            {label === "Messaggi" && <strong>2</strong>}
          </button>
        ))}
      </nav>
      <nav className="nav-group utilities" aria-label="Strumenti">
        {utilityItems.map(([label, Icon]) => (
          <button className="nav-item" key={label}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="support-card">
        <HeartHandshake size={24} />
        <h3>Il tuo impegno fa la differenza</h3>
        <p>Grazie a tutti i volontari della community.</p>
        <button>Scopri di più</button>
      </div>
      <button className="help-link">
        <CircleHelp size={16} />
        Aiuto e contatti
      </button>
      <small>© 2026 gattografy</small>
    </aside>
  );
}

function Topbar({ currentUser, onOpenAuth, onLogout }) {
  return (
    <header className="topbar">
      <label className="search-box">
        <Search size={18} />
        <input placeholder="Cerca colonie, zone, gatti..." />
        <kbd>⌘K</kbd>
      </label>
      <div className="account">
        <span className={isSupabaseConfigured ? "db-status connected" : "db-status"}>
          {isSupabaseConfigured ? "DB collegato" : "Demo DB"}
        </span>
        <button className="icon-btn alert" aria-label="Notifiche">
          <Bell size={19} />
          <span>3</span>
        </button>
        <PhotoImage photo={currentUser.avatar || catPhotos[4]} alt="Avatar utente" />
        <div>
          <strong>Ciao, {currentUser.username}</strong>
          <small>{currentUser.role}</small>
        </div>
        <ChevronDown size={17} />
        <button className="text-action" onClick={onOpenAuth}>Account</button>
        <button className="text-action ghost" onClick={onLogout}>Esci</button>
      </div>
    </header>
  );
}

function MapSection({
  colonies,
  selected,
  selectedId,
  onSelect,
  onAddCat,
  onReportKitten,
  comments,
  draft,
  setDraft,
  addComment,
  participationRequests,
  friendRequests,
  messages,
  messageDraft,
  setMessageDraft,
  onToggleAsl,
  onReplaceAdmin,
  onApproveParticipation,
  onAcceptFriend,
  onSendMessage,
}) {
  return (
    <div className="content-grid">
      <section className="map-column" aria-label="Mappa delle colonie">
        <MapCanvas colonies={colonies} selectedId={selectedId} onSelect={onSelect} />
        <ColonyList colonies={colonies} selectedId={selectedId} onSelect={onSelect} />
      </section>
      <DetailPanel
        selected={selected}
        onAddCat={onAddCat}
        onReportKitten={onReportKitten}
        comments={comments}
        draft={draft}
        setDraft={setDraft}
        addComment={addComment}
        participationRequests={participationRequests}
        friendRequests={friendRequests}
        messages={messages}
        messageDraft={messageDraft}
        setMessageDraft={setMessageDraft}
        onToggleAsl={onToggleAsl}
        onReplaceAdmin={onReplaceAdmin}
        onApproveParticipation={onApproveParticipation}
        onAcceptFriend={onAcceptFriend}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

function MapCanvas({ colonies, selectedId, onSelect }) {
  const selected = colonies.find((colony) => colony.id === selectedId) ?? colonies[0];

  return (
    <div className="map-canvas">
      <button className="filter-button">
        <Settings size={17} />
        Filtri
      </button>
      <MapContainer
        center={[selected.lat, selected.lng]}
        zoom={15}
        scrollWheelZoom
        className="real-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFlyTo selected={selected} />
        {colonies.map((colony) => (
          <Marker
            key={colony.id}
            position={[colony.lat, colony.lng]}
            icon={colony.id === selectedId ? selectedMarkerIcon : colonyMarkerIcon}
            eventHandlers={{ click: () => onSelect(colony.id) }}
          >
            <Popup>
              <strong>{colony.name}</strong>
              <span>{colony.zone}</span>
              <button onClick={() => onSelect(colony.id)}>Apri scheda</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function ColonyList({ colonies, selectedId, onSelect }) {
  return (
    <section className="colony-list">
      <div className="list-heading">
        <h2>Colonie nella mappa ({colonies.length})</h2>
        <label>
          Ordina:
          <select defaultValue="recenti">
            <option value="recenti">Più recenti</option>
            <option value="gatti">Più gatti</option>
            <option value="criticita">Con criticità</option>
          </select>
        </label>
      </div>
      {colonies.map((colony) => (
        <button
          className={colony.id === selectedId ? "colony-row selected" : "colony-row"}
          onClick={() => onSelect(colony.id)}
          key={colony.id}
        >
          <PhotoImage photo={colony.photos[0]} alt="" />
          <span className="row-main">
            <strong>{colony.name}</strong>
            <small>{colony.zone}</small>
            <em>{colony.caretaker}</em>
          </span>
          <span className="row-stat">
            <Cat size={18} />
            {colony.cats}
            <small>Gatti</small>
          </span>
          <span className="row-stat">
            <PawPrint size={18} />
            {colony.kittens}
            <small>Cucciolate</small>
          </span>
          <span className={colony.aslDeclared ? "asl-tag declared" : "asl-tag"}>
            {colony.aslDeclared ? "ASL sì" : "ASL no"}
          </span>
          <span className="row-updated">Aggiornata {colony.updated}</span>
        </button>
      ))}
    </section>
  );
}

function DetailPanel({
  selected,
  onAddCat,
  onReportKitten,
  comments,
  draft,
  setDraft,
  addComment,
  participationRequests,
  friendRequests,
  messages,
  messageDraft,
  setMessageDraft,
  onToggleAsl,
  onReplaceAdmin,
  onApproveParticipation,
  onAcceptFriend,
  onSendMessage,
}) {
  return (
    <aside className="detail-panel">
      <div className="detail-title">
        <span className="pin-badge">
          <MapPin size={20} />
        </span>
        <div>
          <h1>{selected.name}</h1>
          <p>{selected.zone}</p>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer">
            Apri in Google Maps
          </a>
        </div>
        <button className="status-button">{selected.status}</button>
      </div>
      <div className="facts">
        <Fact icon={ShieldCheck} label="Amministratore colonia" value={selected.admin} />
        <Fact icon={Users} label="Referente" value={selected.caretaker} />
        <Fact icon={Clock3} label="Ultimo aggiornamento" value={selected.updated} />
        <Fact icon={Cat} label="Gatti censiti" value={selected.cats} />
        <Fact icon={PawPrint} label="Cucciolate (2026)" value={selected.kittens} />
        <Fact
          icon={ShieldCheck}
          label="Dichiarata all'ASL"
          value={selected.aslDeclared ? "Sì" : "No"}
        />
      </div>
      <AdminPanel
        selected={selected}
        participationRequests={participationRequests}
        onToggleAsl={onToggleAsl}
        onReplaceAdmin={onReplaceAdmin}
        onApproveParticipation={onApproveParticipation}
      />
      <MediaStrip photos={selected.photos} title="Foto della colonia" />
      <section className="cats-section">
        <div className="section-title">
          <h2>Gatti della colonia ({selected.cats})</h2>
          <button>Vedi tutti</button>
        </div>
        {selected.cats > 0 ? (
          <div className="cat-cards">
            {cats.map((cat) => (
              <article className="cat-card" key={cat.name}>
                <PhotoImage photo={cat.photo} alt={cat.name} />
                <strong>{cat.name}</strong>
                <span>{cat.sex}</span>
                <small>{cat.note}</small>
                <ShieldCheck size={18} />
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Cat size={26} />
            <strong>Nessun gatto censito</strong>
            <span>Usa “Aggiungi un gatto” per iniziare la colonia di test.</span>
          </div>
        )}
      </section>
      <section className="actions">
        <ActionButton icon={Cat} label="Aggiungi un gatto" onClick={onAddCat} />
        <ActionButton icon={Eye} label="Segnala avvistamento" tone="blue" />
        <ActionButton icon={PawPrint} label="Segnala cucciolata" tone="orange" onClick={onReportKitten} />
        <ActionButton icon={HeartHandshake} label="Richiedi aiuto o recupero" tone="red" />
      </section>
      <SocialPanel
        friendRequests={friendRequests}
        messages={messages}
        messageDraft={messageDraft}
        setMessageDraft={setMessageDraft}
        onAcceptFriend={onAcceptFriend}
        onSendMessage={onSendMessage}
      />
      <section className="comments">
        <h2>Commenti e aggiornamenti</h2>
        <div className="comment-input">
          <PhotoImage photo={catPhotos[4]} alt="" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addComment()}
            placeholder="Scrivi un commento o un aggiornamento..."
          />
          <button aria-label="Carica foto">
            <Camera size={17} />
          </button>
          <button onClick={addComment}>Invia</button>
        </div>
        {comments.map((comment, index) => (
          <article className="comment" key={`${comment}-${index}`}>
            <PhotoImage photo={index === 0 ? catPhotos[4] : catPhotos[0]} alt="" />
            <div>
              <strong>{index === 0 ? "Sara" : "Laura B."}</strong>
              <span>{index === 0 ? "adesso" : "oggi, 09:24"}</span>
              <p>{comment}</p>
              <button>Rispondi</button>
            </div>
          </article>
        ))}
      </section>
    </aside>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="fact">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MediaStrip({ photos, title }) {
  return (
    <section className="media-strip">
      <h2>{title}</h2>
      <div>
        {photos.map((photo, index) => (
          <PhotoImage photo={photo} alt="" key={`${photo}-${index}`} />
        ))}
      </div>
    </section>
  );
}

function ActionButton({ icon: Icon, label, tone = "green", onClick }) {
  return (
    <button className={`action-button ${tone}`} onClick={onClick}>
      <Icon size={26} />
      <span>{label}</span>
    </button>
  );
}

function AdminPanel({
  selected,
  participationRequests,
  onToggleAsl,
  onReplaceAdmin,
  onApproveParticipation,
}) {
  const colonyAdminUser = seedUsers.find((user) => user.username === selected.admin);
  const candidateAdmins = [
    "Sara",
    "Laura B.",
    "Marco T.",
    "Elisa R.",
    "Giulia N.",
    "Dario P.",
    ...seedUsers.map((user) => user.username),
  ];

  return (
    <section className="admin-panel">
      <div className="section-title compact">
        <h2>Gestione permessi</h2>
        <span>Admin sito: controllo totale</span>
      </div>
      <div className="admin-grid">
        <article className="super-admin">
          <span>Admin sito</span>
          <strong>Sara</strong>
          <small>Può deporre o sostituire qualsiasi amministratore colonia.</small>
        </article>
        <article>
          <span>Amministratore colonia</span>
          <div className="admin-identity">
            {colonyAdminUser?.avatar && (
              <PhotoImage photo={colonyAdminUser.avatar} alt={`Avatar ${selected.admin}`} />
            )}
            <strong>{selected.admin}</strong>
          </div>
          {colonyAdminUser?.email && <small>{colonyAdminUser.email}</small>}
          <small>Chi crea la colonia la amministra finché l'admin sito non interviene.</small>
        </article>
        <label className="admin-select">
          Sostituisci amministratore
          <select value={selected.admin} onChange={(event) => onReplaceAdmin(event.target.value)}>
            {candidateAdmins.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="asl-toggle">
          <input
            type="checkbox"
            checked={selected.aslDeclared}
            onChange={onToggleAsl}
          />
          <span>Dichiarata all'ASL</span>
        </label>
        <article className="collaborator-card">
          <span>Utenti autorizzati a editare</span>
          <div className="collaborators">
            {selected.collaborators.length ? (
              selected.collaborators.map((name) => <em key={name}>{name}</em>)
            ) : (
              <small>Nessun collaboratore attivo</small>
            )}
          </div>
        </article>
      </div>
      <div className="request-list">
        <h3>Richieste di partecipazione</h3>
        {participationRequests.map((request) => (
          <article key={request.id} className="request-row">
            <div>
              <strong>{request.user}</strong>
              <p>{request.message}</p>
              <small>{request.status}</small>
            </div>
            <button
              disabled={request.status === "Approvata"}
              onClick={() => onApproveParticipation(request.id)}
            >
              {request.status === "Approvata" ? "Approvata" : "Approva"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function SocialPanel({
  friendRequests,
  messages,
  messageDraft,
  setMessageDraft,
  onAcceptFriend,
  onSendMessage,
}) {
  return (
    <section className="social-panel">
      <div className="section-title compact">
        <h2>Amicizie e messaggi</h2>
        <button>
          <Plus size={16} />
          Nuova chat
        </button>
      </div>
      <div className="social-grid">
        <div className="friend-box">
          <h3>Richieste di amicizia</h3>
          {friendRequests.map((request) => (
            <article key={request.id}>
              <div>
                <strong>{request.user}</strong>
                <small>{request.note}</small>
              </div>
              <button
                disabled={request.accepted}
                onClick={() => onAcceptFriend(request.id)}
              >
                {request.accepted ? "Amica" : "Accetta"}
              </button>
            </article>
          ))}
        </div>
        <div className="message-box">
          <h3>Messaggi colonia</h3>
          <div className="message-list">
            {messages.map((message) => (
              <article key={message.id}>
                <strong>{message.from}</strong>
                <span>{message.time}</span>
                <p>{message.text}</p>
              </article>
            ))}
          </div>
          <div className="message-input">
            <input
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && onSendMessage()}
              placeholder="Scrivi un messaggio..."
            />
            <button onClick={onSendMessage}>
              <MessageCircle size={17} />
              Invia
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ColoniesSection({
  colonies,
  selectedId,
  dataStatus,
  isDataBusy,
  onSelect,
  onCreateColony,
}) {
  const [isCreating, setCreating] = useState(false);
  const [newColony, setNewColony] = useState({
    name: "",
    address: "",
    city: "",
    lat: "",
    lng: "",
    aslDeclared: false,
  });
  const declaredCount = colonies.filter((colony) => colony.aslDeclared).length;
  const totalCats = colonies.reduce((sum, colony) => sum + colony.cats, 0);
  const updateField = (field) => (event) => {
    const value = field === "aslDeclared" ? event.target.checked : event.target.value;
    setNewColony((current) => ({ ...current, [field]: value }));
  };

  async function submitColony(event) {
    event.preventDefault();
    const created = await onCreateColony(newColony);
    if (!created) return;

    setNewColony({
      name: "",
      address: "",
      city: "",
      lat: "",
      lng: "",
      aslDeclared: false,
    });
    setCreating(false);
  }

  return (
    <section className="page-section">
      <PageHeader
        title="Colonie"
        description="Gestione delle colonie registrate, amministratori, stato ASL e numeri principali."
        action="Nuova colonia"
        onAction={() => setCreating((value) => !value)}
      />
      <div className={isDataBusy ? "data-banner loading" : "data-banner"}>
        {isDataBusy ? "Sincronizzazione dati..." : dataStatus}
      </div>
      {isCreating && (
        <form className="create-panel" onSubmit={submitColony}>
          <label>
            Nome colonia
            <input
              value={newColony.name}
              onChange={updateField("name")}
              placeholder="es. Colonia Porto"
            />
          </label>
          <label>
            Indirizzo
            <input
              value={newColony.address}
              onChange={updateField("address")}
              placeholder="Via e numero civico"
            />
          </label>
          <label>
            Città
            <input
              value={newColony.city}
              onChange={updateField("city")}
              placeholder="Napoli"
            />
          </label>
          <label>
            Latitudine
            <input
              value={newColony.lat}
              onChange={updateField("lat")}
              placeholder="40.8504"
            />
          </label>
          <label>
            Longitudine
            <input
              value={newColony.lng}
              onChange={updateField("lng")}
              placeholder="14.2656"
            />
          </label>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={newColony.aslDeclared}
              onChange={updateField("aslDeclared")}
            />
            Dichiarata all'ASL
          </label>
          <button className="primary">Salva colonia</button>
        </form>
      )}
      <div className="metric-grid">
        <Metric icon={MapPin} label="Colonie registrate" value={colonies.length} />
        <Metric icon={Cat} label="Gatti censiti" value={totalCats} />
        <Metric icon={ShieldCheck} label="Dichiarate all'ASL" value={declaredCount} />
      </div>
      <div className="table-panel">
        <div className="table-row head">
          <span>Colonia</span>
          <span>Amministratore</span>
          <span>ASL</span>
          <span>Gatti</span>
          <span>Azione</span>
        </div>
        {colonies.map((colony) => (
          <div className={colony.id === selectedId ? "table-row selected" : "table-row"} key={colony.id}>
            <span>
              <strong>{colony.name}</strong>
              <small>{colony.zone}</small>
            </span>
            <span>{colony.admin}</span>
            <span className={colony.aslDeclared ? "asl-tag declared" : "asl-tag"}>
              {colony.aslDeclared ? "ASL sì" : "ASL no"}
            </span>
            <span>{colony.cats}</span>
            <button onClick={() => onSelect(colony.id)}>Apri</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CatsSection({ colonies }) {
  const registryCats = colonies.flatMap((colony) =>
    colony.cats > 0
      ? cats.slice(0, Math.min(cats.length, 4)).map((cat, index) => ({
          ...cat,
          id: `${colony.id}-${cat.name}-${index}`,
          colony: colony.name,
          zone: colony.zone,
          lastSeen: index === 0 ? "oggi" : "questa settimana",
        }))
      : [],
  );

  return (
    <section className="page-section">
      <PageHeader
        title="Gatti"
        description="Registro dei gatti censiti, con foto, colonia, stato e ultimo avvistamento."
        action="Aggiungi gatto"
      />
      <div className="registry-grid">
        {registryCats.map((cat) => (
          <article className="registry-card" key={cat.id}>
            <PhotoImage photo={cat.photo} alt={cat.name} />
            <div>
              <strong>{cat.name}</strong>
              <span>{cat.sex} · {cat.note}</span>
              <small>{cat.colony}</small>
              <em>Ultimo avvistamento: {cat.lastSeen}</em>
            </div>
            <button>Apri scheda</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReportsSection({ colonies }) {
  const reports = [
    {
      title: "Richiesta recupero urgente",
      colony: "Angiporto dei Caserti",
      type: "Soccorso",
      status: "Aperta",
      tone: "red",
    },
    {
      title: "Possibile gatto già censito in altra colonia",
      colony: "Giardini di Via Padova",
      type: "Avvistamento",
      status: "Da verificare",
      tone: "blue",
    },
    {
      title: "Segnalata nuova cucciolata",
      colony: "Cortile di Via Prina",
      type: "Cucciolata",
      status: "In corso",
      tone: "orange",
    },
  ];

  return (
    <section className="page-section">
      <PageHeader
        title="Segnalazioni"
        description="Avvistamenti, cucciolate, problemi, richieste di recupero e verifiche incrociate."
        action="Nuova segnalazione"
      />
      <div className="kanban-grid">
        {["Aperta", "Da verificare", "In corso"].map((status) => (
          <div className="kanban-column" key={status}>
            <h2>{status}</h2>
            {reports
              .filter((report) => report.status === status)
              .map((report) => (
                <article className={`report-card ${report.tone}`} key={report.title}>
                  <span>{report.type}</span>
                  <strong>{report.title}</strong>
                  <small>{report.colony}</small>
                  <button>Gestisci</button>
                </article>
              ))}
          </div>
        ))}
      </div>
      <small className="section-note">
        Colonie monitorate: {colonies.length}. Le segnalazioni saranno salvate in Postgres con stato, priorità e storico.
      </small>
    </section>
  );
}

function MessagesSection({
  friendRequests,
  messages,
  messageDraft,
  setMessageDraft,
  onAcceptFriend,
  onSendMessage,
}) {
  return (
    <section className="page-section">
      <PageHeader
        title="Messaggi"
        description="Chat operative tra volontari, amministratori colonia e admin sito."
        action="Nuovo messaggio"
      />
      <SocialPanel
        friendRequests={friendRequests}
        messages={messages}
        messageDraft={messageDraft}
        setMessageDraft={setMessageDraft}
        onAcceptFriend={onAcceptFriend}
        onSendMessage={onSendMessage}
      />
    </section>
  );
}

function CommunitySection({
  colonies,
  participationRequests,
  friendRequests,
  onApproveParticipation,
  onAcceptFriend,
}) {
  return (
    <section className="page-section">
      <PageHeader
        title="Community"
        description="Richieste di amicizia, partecipazione alle colonie e rete dei volontari."
        action="Invita utente"
      />
      <div className="community-grid">
        <div className="table-panel">
          <h2>Richieste di partecipazione</h2>
          {participationRequests.map((request) => {
            const colony = colonies.find((item) => item.id === request.colonyId);
            return (
              <article className="request-row" key={request.id}>
                <div>
                  <strong>{request.user}</strong>
                  <p>{request.message}</p>
                  <small>{colony?.name ?? "Colonia non trovata"} · {request.status}</small>
                </div>
                <button
                  disabled={request.status === "Approvata"}
                  onClick={() => onApproveParticipation(request.id)}
                >
                  {request.status === "Approvata" ? "Approvata" : "Approva"}
                </button>
              </article>
            );
          })}
        </div>
        <div className="table-panel">
          <h2>Richieste di amicizia</h2>
          {friendRequests.map((request) => (
            <article className="request-row" key={request.id}>
              <div>
                <strong>{request.user}</strong>
                <p>{request.note}</p>
                <small>{request.accepted ? "Accettata" : "In attesa"}</small>
              </div>
              <button disabled={request.accepted} onClick={() => onAcceptFriend(request.id)}>
                {request.accepted ? "Amica" : "Accetta"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageHeader({ title, description, action, onAction }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <button onClick={onAction}>
        <Plus size={18} />
        {action}
      </button>
    </header>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <article className="metric-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function RegisterModal({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authStatus,
  isAuthBusy,
  onSubmit,
  onClose,
}) {
  const isRegister = authMode === "register";
  const updateField = (field) => (event) =>
    setAuthForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <form className="register-modal" aria-label="Registrazione" onSubmit={onSubmit}>
      <div className="modal-tabs">
        <button
          type="button"
          className={!isRegister ? "selected" : ""}
          onClick={() => setAuthMode("login")}
        >
          Accedi
        </button>
        <button
          type="button"
          className={isRegister ? "selected" : ""}
          onClick={() => setAuthMode("register")}
        >
          Registrati
        </button>
        <button type="button" className="close" onClick={onClose} aria-label="Chiudi">
          <X size={18} />
        </button>
      </div>
      {isRegister && (
        <div className="avatar-upload">
          <PhotoImage photo={catPhotos[2]} alt="Avatar scelto" />
          <button type="button" aria-label="Carica avatar">
            <ImagePlus size={18} />
          </button>
          <strong>Carica avatar</strong>
          <small>PNG o JPG, max 2MB</small>
        </div>
      )}
      {isRegister && (
        <label>
          Nome utente
          <input
            value={authForm.username}
            onChange={updateField("username")}
            placeholder="es. sara_volontaria"
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          value={authForm.email}
          onChange={updateField("email")}
          placeholder="es. sara@example.com"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={authForm.password}
          onChange={updateField("password")}
          placeholder="Almeno 8 caratteri"
        />
      </label>
      <button className="primary" disabled={isAuthBusy}>
        {isAuthBusy ? "Attendi..." : isRegister ? "Crea account" : "Accedi"}
      </button>
      {authStatus && <p className="auth-status">{authStatus}</p>}
      <p>
        {isRegister ? "Hai già un account?" : "Non hai ancora un account?"}{" "}
        <button
          type="button"
          onClick={() => setAuthMode(isRegister ? "login" : "register")}
        >
          {isRegister ? "Accedi" : "Registrati"}
        </button>
      </p>
      <small>
        {isSupabaseConfigured
          ? "Accesso collegato a Supabase Auth."
          : "Modalità demo: nessuna password viene salvata finché Supabase non è configurato."}
      </small>
    </form>
  );
}

function MobilePreview({ selected, onAddCat, onReportKitten }) {
  return (
    <aside className="phone-preview" aria-label="Anteprima mobile">
      <div className="phone-top">
        <Menu size={18} />
        <span>
          <Cat size={18} />
          gattografy
        </span>
        <Bell size={17} />
      </div>
      <div className="phone-map">
        <button>
          <MapPin size={15} />
        </button>
        <button className="pin-two">9</button>
        <button className="pin-three">2</button>
      </div>
      <article className="phone-card">
        <PhotoImage photo={selected.photos[0]} alt="" />
        <div>
          <strong>{selected.name}</strong>
          <small>{selected.zone}</small>
          <span>{selected.status}</span>
        </div>
      </article>
      <div className="phone-stats">
        <span>
          <Cat size={16} /> {selected.cats} Gatti
        </span>
        <span>
          <PawPrint size={16} /> {selected.kittens} Cucciolate
        </span>
      </div>
      <div className="phone-actions">
        <button onClick={onAddCat}>Aggiungi un gatto</button>
        <button>Segnala avvistamento</button>
        <button onClick={onReportKitten}>Segnala cucciolata</button>
        <button>Richiedi aiuto</button>
      </div>
    </aside>
  );
}

function PhotoImage({ photo, alt }) {
  return <img src={photo} alt={alt} />;
}

createRoot(document.getElementById("root")).render(<App />);
