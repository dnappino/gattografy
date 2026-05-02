import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DivIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
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
  Phone,
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

const catPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="18" fill="#dff1e6"/><path d="M68 94 82 44l34 34h8l34-34 14 50c22 15 35 40 35 69 0 42-35 73-87 73s-87-31-87-73c0-29 13-54 35-69Z" fill="#236b53"/><circle cx="91" cy="139" r="12" fill="#fff"/><circle cx="149" cy="139" r="12" fill="#fff"/><path d="M114 164h12l-6 7Z" fill="#e46755"/><path d="M95 181c15 12 35 12 50 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>',
  );

const colonyPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="18" fill="#e0edf6"/><path d="M120 214s70-56 70-122a70 70 0 0 0-140 0c0 66 70 122 70 122Z" fill="#386e9a"/><circle cx="120" cy="92" r="28" fill="#fff"/><path d="M120 46v92" stroke="#dff1e6" stroke-width="10" stroke-linecap="round"/><path d="M74 92h92" stroke="#dff1e6" stroke-width="10" stroke-linecap="round"/></svg>',
  );

const seedColonies = [
  {
    id: 1,
    name: "Colonia felina della Floridiana",
    zone: "Villa Floridiana - Napoli",
    caretaker: "Da verificare",
    admin: "ilaria_nappino",
    collaborators: [],
    aslDeclared: false,
    status: "Da verificare",
    cats: 0,
    kittens: 0,
    updated: "fonte pubblica",
    lat: 40.8386,
    lng: 14.2305,
    registryNumber: "NA-VER-001",
    locationContext: "Parco pubblico; colonia storica citata da fonti giornalistiche.",
    healthNotes: "Dati sanitari da verificare con tutori e ASL Napoli 1 Centro.",
    sourceLabel: "Ottopagine / Repubblica / Corriere Napoli",
    sourceUrl: "https://www.ottopagine.it/na/attualita/354538/napoli-villa-floridiana-sconvolto-l-habitat-abituale-del-parco.shtml",
    photos: [catPhotos[0], catPhotos[1], catPhotos[2], catPhotos[3]],
  },
  {
    id: 2,
    name: "Colonia felina dei Quartieri Spagnoli",
    zone: "Ex Ospedale Militare, Salita Trinità delle Monache - Napoli",
    caretaker: "Da verificare",
    admin: "ilaria_nappino",
    collaborators: [],
    aslDeclared: false,
    status: "Da verificare",
    cats: 8,
    kittens: 0,
    updated: "fonte pubblica",
    lat: 40.8431,
    lng: 14.2444,
    registryNumber: "NA-VER-002",
    locationContext: "Colonia menzionata in relazione allo spostamento dall'ex Mercatino di Sant'Anna verso l'ex Ospedale Militare.",
    healthNotes: "La fonte cita sopralluogo ASL Napoli 1 Centro e otto gatti; dati sanitari individuali da censire.",
    sourceLabel: "Gazzetta di Napoli / Corriere Napoli",
    sourceUrl: "https://www.gazzettadinapoli.it/notizie/gatti-comune-salva-colonia-dei-quartieri-spagnoli-verra-spostata-nellex-ospedale-militare/",
    photos: [catPhotos[2], catPhotos[4], catPhotos[1]],
  },
  {
    id: 3,
    name: "Colonie feline delle Vele di Scampia",
    zone: "Vele di Scampia - Napoli",
    caretaker: "Da verificare",
    admin: "ilaria_nappino",
    collaborators: [],
    aslDeclared: false,
    status: "Da verificare",
    cats: 0,
    kittens: 0,
    updated: "fonte pubblica",
    lat: 40.8997,
    lng: 14.2372,
    registryNumber: "NA-VER-003",
    locationContext: "Area residenziale; fonti pubbliche parlano di molte colonie feline da tutelare durante gli abbattimenti.",
    healthNotes: "Area ampia: richiede sopralluogo e separazione in colonie specifiche.",
    sourceLabel: "Fanpage Napoli",
    sourceUrl: "https://www.fanpage.it/napoli/non-abbattete-le-vele-di-scampia-sono-piene-di-gatti-appello-degli-animalisti-il-comune-li-salveremo/",
    photos: [catPhotos[5], catPhotos[0]],
  },
  {
    id: 4,
    name: "Colonia felina Via Jannelli - Parco Vanna",
    zone: "Via Gabriele Jannelli, altezza Parco Vanna - Napoli",
    caretaker: "Da verificare",
    admin: "ilaria_nappino",
    collaborators: [],
    aslDeclared: false,
    status: "Da verificare",
    cats: 0,
    kittens: 0,
    updated: "fonte pubblica",
    lat: 40.8587,
    lng: 14.2239,
    registryNumber: "NA-VER-004",
    locationContext: "Vomero; colonia felina curata da volontaria e citata in una fonte pubblica storica.",
    healthNotes: "Stato attuale da confermare in loco.",
    sourceLabel: "Il Roma",
    sourceUrl: "https://www.ilroma.net/news/cronaca/162664/via-jannelli-ignoti-danno-fuoco-a-una-colonia-di-gatti.html",
    photos: [catPhotos[3], catPhotos[4]],
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
    username: "ilaria_nappino",
    email: "ilynap@gmail.com",
    avatar: catThree,
    role: "amministratrice colonia",
    passwordPolicy: "password da impostare nel backend, non salvata nel frontend",
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

function MapBoundsTracker({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

function mapDbColony(row, index = 0) {
  const city = row.city ? ` - ${row.city}` : "";
  const adminProfile = row.admin_profile ?? row.profiles ?? null;

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    zone: `${row.address}${city}`,
    caretaker: adminProfile?.username ?? "admin_default",
    admin: adminProfile?.username ?? "admin_default",
    adminId: row.colony_admin_id,
    createdBy: row.created_by,
    collaborators: [],
    aslDeclared: row.asl_declared,
    status: row.status,
    cats: row.cat_count ?? 0,
    kittens: 0,
    updated: "da DB",
    registryNumber: row.registry_number,
    locationContext: row.location_context,
    healthLastUpdated: row.health_last_updated,
    healthRecordDate: row.health_record_date,
    volunteerName: row.volunteer_name,
    volunteerPhone: row.volunteer_phone,
    volunteerCallHours: row.volunteer_call_hours,
    totalMales: row.total_males ?? 0,
    sterilizedMales: row.sterilized_males ?? 0,
    unsterilizedMales: row.unsterilized_males ?? 0,
    totalFemales: row.total_females ?? 0,
    sterilizedFemales: row.sterilized_females ?? 0,
    unsterilizedFemales: row.unsterilized_females ?? 0,
    totalSterilized: row.total_sterilized ?? 0,
    totalUnsterilized: row.total_unsterilized ?? 0,
    healthNotes: row.health_notes,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url,
    lat: row.lat,
    lng: row.lng,
    photoUrl: row.photo_url ?? "",
    photos: row.photo_url ? [row.photo_url] : [colonyPlaceholder],
  };
}

function mapDbReports(rows, colonyList) {
  return rows.map((row) => {
    const colony = colonyList.find((item) => item.id === row.colony_id);
    return {
      id: row.id,
      colonyId: row.colony_id,
      colony: colony?.name ?? "Colonia",
      type: row.type,
      status: row.status,
      title: row.title,
      description: row.description ?? "",
      author: row.author?.username ?? "",
      createdAt: row.created_at,
      tone: row.type === "rescue" ? "red" : row.type === "birth" ? "orange" : row.type === "problem" ? "orange" : "blue",
    };
  });
}

function mapDbCat(row) {
  return {
    id: row.id,
    colonyId: row.colony_id,
    name: row.name,
    sex: row.sex ?? "",
    status: row.status ?? "",
    notes: row.notes ?? "",
    sterilized: row.sterilized,
    sterilizationDate: row.sterilization_date ?? "",
    sterilizationYear: row.sterilization_year ?? "",
    photoUrl: row.photo_url ?? "",
    earTip: Boolean(row.ear_tip),
    provenance: row.provenance ?? "",
    alreadyPresent: row.already_present,
    description: row.description ?? "",
    approximateBirthDate: row.approximate_birth_date ?? "",
    removalReason: row.removal_reason ?? "",
    removedAt: row.removed_at ?? "",
    photo: row.photo_url || catPlaceholder,
  };
}

function mapRequestStatus(status) {
  if (status === "approved") return "Approvata";
  if (status === "rejected") return "Rifiutata";
  return "In attesa";
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

async function uploadPublicImage(supabase, bucket, file, folder) {
  if (!file) return "";
  const extension = file.name?.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
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
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [reports, setReports] = useState([]);
  const [catsByColony, setCatsByColony] = useState({});
  const [participationRequests, setParticipationRequests] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapBounds, setMapBounds] = useState(null);
  const selected = useMemo(
    () => colonies.find((colony) => colony.id === selectedId) ?? colonies[0],
    [colonies, selectedId],
  );
  const isAuthenticated = Boolean(currentUser?.id || currentUser?.isDemoAuthenticated);
  const isSiteAdmin = currentUser?.role === "site_admin" || currentUser?.role === "amministratrice sito";
  const canEditSelected =
    isAuthenticated &&
    (isSiteAdmin ||
      selected.adminId === currentUser?.id ||
      selected.createdBy === currentUser?.id ||
      selected.admin === currentUser?.username ||
      selected.collaborators?.includes(currentUser?.username));
  const visibleCats = catsByColony[selected?.id] ?? [];
  const helpReports = reports.filter((report) => report.type === "rescue" || report.type === "problem");
  const menuCounts = {
    Segnalazioni: reports.filter((report) => report.status !== "closed").length,
    Messaggi: privateMessages.length,
  };
  const filteredColonies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return colonies;
    return colonies.filter((colony) =>
      [colony.name, colony.zone, colony.admin, colony.caretaker, colony.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [colonies, searchQuery]);

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
          setCurrentUser(null);
          setFriendRequests([]);
          setMessages([]);
          setNotifications([]);
        }
      });
      unsubscribe = listener.subscription.unsubscribe;
    }

    loadSession();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!selected?.id) return;
    loadColonyActivity(selected.id);
  }, [selected?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadSocialData();
    loadNotifications();
  }, [isAuthenticated, currentUser?.id]);

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
        .select("id,name,address,city,location_context,lat,lng,status,asl_declared,registry_number,health_last_updated,health_record_date,volunteer_name,volunteer_phone,volunteer_call_hours,total_males,sterilized_males,unsterilized_males,total_females,sterilized_females,unsterilized_females,total_sterilized,total_unsterilized,health_notes,source_label,source_url,photo_url,created_by,colony_admin_id,created_at,admin_profile:profiles!colonies_colony_admin_id_fkey(username,email,avatar_url)")
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

      const { data: reportRows } = await supabase
        .from("reports")
        .select("id,colony_id,type,status,title,description,created_at,author:profiles!reports_created_by_fkey(username)")
        .order("created_at", { ascending: false })
        .limit(40);
      setReports(mapDbReports(reportRows ?? [], mapped));
    } catch (error) {
      setDataStatus(`Errore lettura Supabase: ${error.message}`);
    } finally {
      setDataBusy(false);
    }
  }

  async function loadColonyActivity(colonyId) {
    const supabase = await getSupabaseClient();
    if (!supabase || !colonyId) return;

    try {
      const [{ data: reportRows, error: reportError }, { data: catRows, error: catError }] =
        await Promise.all([
          supabase
            .from("reports")
            .select("id,colony_id,type,status,title,description,created_at,author:profiles!reports_created_by_fkey(username)")
            .eq("colony_id", colonyId)
            .order("created_at", { ascending: false }),
          supabase
            .from("cats")
            .select("id,colony_id,name,sex,status,notes,sterilized,sterilization_date,sterilization_year,ear_tip,provenance,already_present,description,approximate_birth_date,removal_reason,removed_at,photo_url,created_at")
            .eq("colony_id", colonyId)
            .order("created_at", { ascending: false }),
        ]);

      if (reportError) throw reportError;
      if (catError) throw catError;

      setReports((items) => {
        const otherColonies = items.filter((item) => item.colonyId !== colonyId);
        return [
          ...mapDbReports(reportRows ?? [], colonies),
          ...otherColonies,
        ];
      });
      setCatsByColony((items) => ({
        ...items,
        [colonyId]: (catRows ?? []).map(mapDbCat),
      }));
    } catch (error) {
      setDataStatus(`Errore lettura attività colonia: ${error.message}`);
    }

    if (!isAuthenticated) return;

    try {
      const [{ data: commentRows }, { data: messageRows }, { data: requestRows }] =
        await Promise.all([
          supabase
            .from("comments")
            .select("id,body,created_at")
            .eq("colony_id", colonyId)
            .order("created_at", { ascending: false }),
          supabase
            .from("messages")
            .select("id,body,created_at,sender_id")
            .eq("colony_id", colonyId)
            .order("created_at", { ascending: true }),
          supabase
            .from("participation_requests")
            .select("id,colony_id,message,status,created_at,profile:profiles(username)")
            .eq("colony_id", colonyId)
            .order("created_at", { ascending: false }),
        ]);

      setComments((commentRows ?? []).map((row) => row.body));
      setMessages((messageRows ?? []).map((row) => ({
        id: row.id,
        from: row.sender_id === currentUser?.id ? currentUser.username : "Utente",
        text: row.body,
        time: formatDate(row.created_at),
      })));
      setParticipationRequests((requestRows ?? []).map((row) => ({
        id: row.id,
        colonyId: row.colony_id,
        user: row.profile?.username ?? "Utente",
        message: row.message ?? "",
        status: mapRequestStatus(row.status),
      })));
    } catch (error) {
      setDataStatus(`Errore lettura social: ${error.message}`);
    }
  }

  async function loadSocialData() {
    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return;

    try {
      const [
        { data: profileRows, error: profileError },
        { data: friendRows, error: friendError },
        { data: directRows, error: directError },
        { data: threadRows, error: threadError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,username,email,avatar_url,role")
          .neq("id", currentUser.id)
          .order("username", { ascending: true }),
        supabase
          .from("friend_requests")
          .select("id,from_profile_id,to_profile_id,status,created_at,from_profile:profiles!friend_requests_from_profile_id_fkey(username),to_profile:profiles!friend_requests_to_profile_id_fkey(username)")
          .or(`from_profile_id.eq.${currentUser.id},to_profile_id.eq.${currentUser.id}`)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("id,sender_id,recipient_id,body,created_at,sender:profiles!messages_sender_id_fkey(username),recipient:profiles!messages_recipient_id_fkey(username)")
          .is("colony_id", null)
          .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
          .order("created_at", { ascending: true }),
        supabase
          .from("forum_threads")
          .select("id,title,body,category,created_at,author:profiles!forum_threads_author_id_fkey(username),posts:forum_posts(id,body,created_at,author:profiles!forum_posts_author_id_fkey(username))")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      if (profileError) throw profileError;
      if (friendError) throw friendError;
      if (directError) throw directError;
      if (threadError) throw threadError;

      setProfiles(profileRows ?? []);
      setFriendRequests((friendRows ?? []).map((row) => {
        const incoming = row.to_profile_id === currentUser.id;
        return {
          id: row.id,
          user: incoming ? row.from_profile?.username : row.to_profile?.username,
          note: incoming ? "Richiesta ricevuta" : "Richiesta inviata",
          accepted: row.status === "approved",
          incoming,
          status: row.status,
        };
      }));
    setPrivateMessages((directRows ?? []).map((row) => ({
        id: row.id,
        from: row.sender_id === currentUser.id ? currentUser.username : row.sender?.username ?? "Utente",
        to: row.recipient_id === currentUser.id ? currentUser.username : row.recipient?.username ?? "Utente",
        text: row.body,
        time: formatDate(row.created_at),
      })));
      setForumThreads((threadRows ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        category: row.category,
        author: row.author?.username ?? "Utente",
        time: formatDate(row.created_at),
        posts: (row.posts ?? []).map((post) => ({
          id: post.id,
          author: post.author?.username ?? "Utente",
          body: post.body,
          time: formatDate(post.created_at),
        })),
      })));
    } catch (error) {
      setDataStatus(`Errore social: ${error.message}`);
    }
  }

  async function loadNotifications() {
    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,title,body,type,is_read,created_at")
        .eq("recipient_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotifications((data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body ?? "",
        type: row.type,
        read: row.is_read,
        time: formatDate(row.created_at),
      })));
    } catch (error) {
      setDataStatus(`Errore notifiche: ${error.message}`);
    }
  }

  async function notifyAdmins(type, title, body) {
    const localNotification = {
      id: `local-${Date.now()}`,
      title,
      body,
      type,
      read: false,
      time: "adesso",
    };
    if (isSiteAdmin) setNotifications((items) => [localNotification, ...items]);

    const supabase = await getSupabaseClient();
    if (!supabase) return;

    const { data: admins, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "site_admin");
    if (error || !admins?.length) return;

    await supabase.from("notifications").insert(
      admins.map((admin) => ({
        recipient_id: admin.id,
        actor_id: currentUser?.id ?? null,
        type,
        title,
        body,
      })),
    );
    if (currentUser?.role === "site_admin") await loadNotifications();
  }

  async function createColony(newColony) {
    if (!isAuthenticated) {
      setAuthMode("login");
      setRegisterOpen(true);
      setDataStatus("Accedi per creare una colonia.");
      return false;
    }

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
    if (!supabase || !currentUser?.id) {
      const demoColony = {
        id: Date.now(),
        name: colonyName,
        address,
        city,
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
          location_context: newColony.locationContext.trim() || null,
          lat: parsedLat,
          lng: parsedLng,
          status: "Attiva",
          asl_declared: newColony.aslDeclared,
          registry_number: newColony.registryNumber.trim() || null,
          health_last_updated: newColony.healthLastUpdated || null,
          health_record_date: newColony.healthRecordDate || null,
          volunteer_name: newColony.volunteerName.trim() || null,
          volunteer_phone: newColony.volunteerPhone.trim() || null,
          volunteer_call_hours: newColony.volunteerCallHours.trim() || null,
          health_notes: newColony.healthNotes.trim() || null,
          created_by: currentUser.id,
          colony_admin_id: currentUser.id,
        })
        .select("id,name,address,city,location_context,lat,lng,status,asl_declared,registry_number,health_last_updated,health_record_date,volunteer_name,volunteer_phone,volunteer_call_hours,total_males,sterilized_males,unsterilized_males,total_females,sterilized_females,unsterilized_females,total_sterilized,total_unsterilized,health_notes,source_label,source_url,photo_url,created_by,colony_admin_id,created_at,admin_profile:profiles!colonies_colony_admin_id_fkey(username,email,avatar_url)")
        .single();

      if (error) throw error;

      let savedColony = data;
      if (newColony.photoFile) {
        const photoUrl = await uploadPublicImage(
          supabase,
          "colony-photos",
          newColony.photoFile,
          `colonies/${data.id}`,
        );
        if (photoUrl) {
          const { data: photoData } = await supabase
            .from("colonies")
            .update({ photo_url: photoUrl })
            .eq("id", data.id)
            .select("id,name,address,city,location_context,lat,lng,status,asl_declared,registry_number,health_last_updated,health_record_date,volunteer_name,volunteer_phone,volunteer_call_hours,total_males,sterilized_males,unsterilized_males,total_females,sterilized_females,unsterilized_females,total_sterilized,total_unsterilized,health_notes,source_label,source_url,photo_url,created_by,colony_admin_id,created_at,admin_profile:profiles!colonies_colony_admin_id_fkey(username,email,avatar_url)")
            .single();
          if (photoData) savedColony = photoData;
        }
      }

      const mapped = mapDbColony(savedColony);
      setColonies((items) => [mapped, ...items]);
      setSelectedId(mapped.id);
      setDataStatus(`Colonia "${mapped.name}" salvata su Supabase.`);
      await notifyAdmins("new_colony", "Nuova colonia", `${mapped.name} registrata da ${currentUser.username}`);
      return true;
    } catch (error) {
      setDataStatus(`Errore creazione colonia: ${error.message}`);
      return false;
    } finally {
      setDataBusy(false);
    }
  }

  async function updateColony(colonyId, patch) {
    if (!isAuthenticated || !canEditSelected) {
      setAuthMode("login");
      setRegisterOpen(true);
      setDataStatus("Accedi con un utente autorizzato per modificare la colonia.");
      return false;
    }

    const cleaned = {
      ...patch,
      name: patch.name?.trim(),
      address: patch.address?.trim(),
      city: patch.city?.trim(),
      status: patch.status?.trim() || "Attiva",
      lat: Number(patch.lat),
      lng: Number(patch.lng),
      totalMales: Number(patch.totalMales) || 0,
      sterilizedMales: Number(patch.sterilizedMales) || 0,
      unsterilizedMales: Number(patch.unsterilizedMales) || 0,
      totalFemales: Number(patch.totalFemales) || 0,
      sterilizedFemales: Number(patch.sterilizedFemales) || 0,
      unsterilizedFemales: Number(patch.unsterilizedFemales) || 0,
      totalSterilized: Number(patch.totalSterilized) || 0,
      totalUnsterilized: Number(patch.totalUnsterilized) || 0,
    };

    if (!cleaned.name || !cleaned.address || !cleaned.city || Number.isNaN(cleaned.lat) || Number.isNaN(cleaned.lng)) {
      setDataStatus("Nome, indirizzo, città, latitudine e longitudine sono obbligatori.");
      return false;
    }

    const supabase = await getSupabaseClient();
    const applyLocalUpdate = (row) => {
      const mapped = mapDbColony(row);
      setColonies((items) =>
        items.map((item) =>
          item.id === colonyId ? { ...item, ...mapped, photos: item.photos } : item,
        ),
      );
    };

    if (!supabase || currentUser?.isDemoAuthenticated) {
      setColonies((items) =>
        items.map((item) =>
          item.id === colonyId
            ? {
                ...item,
                ...cleaned,
                zone: `${cleaned.address} - ${cleaned.city}`,
                photoUrl: cleaned.photoPreview || cleaned.photoUrl || item.photoUrl,
                photos: [cleaned.photoPreview || cleaned.photoUrl || item.photoUrl || colonyPlaceholder],
                updated: "adesso",
              }
            : item,
        ),
      );
      setDataStatus("Modifiche salvate nella demo locale.");
      return true;
    }

    setDataBusy(true);
    try {
      let photoUrl = cleaned.photoUrl || "";
      if (cleaned.photoFile) {
        photoUrl = await uploadPublicImage(
          supabase,
          "colony-photos",
          cleaned.photoFile,
          `colonies/${colonyId}`,
        );
      }

      const { data, error } = await supabase
        .from("colonies")
        .update({
          name: cleaned.name,
          address: cleaned.address,
          city: cleaned.city,
          location_context: cleaned.locationContext?.trim() || null,
          lat: cleaned.lat,
          lng: cleaned.lng,
          status: cleaned.status,
          asl_declared: Boolean(cleaned.aslDeclared),
          registry_number: cleaned.registryNumber?.trim() || null,
          health_last_updated: cleaned.healthLastUpdated || null,
          health_record_date: cleaned.healthRecordDate || null,
          volunteer_name: cleaned.volunteerName?.trim() || null,
          volunteer_phone: cleaned.volunteerPhone?.trim() || null,
          volunteer_call_hours: cleaned.volunteerCallHours?.trim() || null,
          total_males: cleaned.totalMales,
          sterilized_males: cleaned.sterilizedMales,
          unsterilized_males: cleaned.unsterilizedMales,
          total_females: cleaned.totalFemales,
          sterilized_females: cleaned.sterilizedFemales,
          unsterilized_females: cleaned.unsterilizedFemales,
          total_sterilized: cleaned.totalSterilized,
          total_unsterilized: cleaned.totalUnsterilized,
          health_notes: cleaned.healthNotes?.trim() || null,
          photo_url: photoUrl || null,
        })
        .eq("id", colonyId)
        .select("id,name,address,city,location_context,lat,lng,status,asl_declared,registry_number,health_last_updated,health_record_date,volunteer_name,volunteer_phone,volunteer_call_hours,total_males,sterilized_males,unsterilized_males,total_females,sterilized_females,unsterilized_females,total_sterilized,total_unsterilized,health_notes,source_label,source_url,photo_url,created_by,colony_admin_id,created_at,admin_profile:profiles!colonies_colony_admin_id_fkey(username,email,avatar_url)")
        .single();

      if (error) throw error;

      applyLocalUpdate(data);
      setDataStatus(`Colonia "${cleaned.name}" aggiornata su Supabase.`);
      return true;
    } catch (error) {
      setDataStatus(`Errore modifica colonia: ${error.message}`);
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
        demoUser.isDemoAuthenticated = true;
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
        await notifyAdmins("new_user", "Nuovo utente", `${authForm.username} ha creato un account`);
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
    setCurrentUser(null);
    setFriendRequests([]);
    setMessages([]);
    setNotifications([]);
    setRegisterOpen(false);
    setAuthMode("login");
    setAuthStatus("Sessione chiusa.");
  }

  function addCat() {
    if (!canEditSelected) {
      setAuthMode("login");
      setRegisterOpen(true);
      return;
    }
    const newCat = {
      id: `local-${Date.now()}`,
      colonyId: selected.id,
      name: "Nuovo gatto",
      sex: "",
      status: "Da verificare",
      notes: "",
      sterilized: null,
      earTip: false,
      photo: catPlaceholder,
    };
    setCatsByColony((items) => ({
      ...items,
      [selected.id]: [newCat, ...(items[selected.id] ?? [])],
    }));
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, cats: item.cats + 1, updated: "adesso" }
          : item,
      ),
    );
  }

  function reportKitten() {
    if (!canEditSelected) {
      setAuthMode("login");
      setRegisterOpen(true);
      return;
    }
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, kittens: item.kittens + 1, status: "Attiva", updated: "adesso" }
          : item,
      ),
    );
  }

  function addComment() {
    if (!isAuthenticated) {
      setAuthMode("login");
      setRegisterOpen(true);
      return;
    }
    if (!draft.trim()) return;
    saveComment(draft.trim());
    setDraft("");
  }

  function toggleAslDeclared() {
    if (!canEditSelected) return;
    setColonies((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, aslDeclared: !item.aslDeclared, updated: "adesso" }
          : item,
      ),
    );
  }

  function replaceColonyAdmin(nextAdmin) {
    if (!canEditSelected) return;
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
    if (!canEditSelected) return;
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
    if (!isAuthenticated) {
      setAuthMode("login");
      setRegisterOpen(true);
      return;
    }
    setFriendRequests((items) =>
      items.map((item) =>
        item.id === requestId ? { ...item, accepted: true } : item,
      ),
    );
    saveFriendApproval(requestId);
  }

  async function saveFriendApproval(requestId) {
    if (String(requestId).startsWith("local-")) return;
    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return;

    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "approved" })
      .eq("id", requestId);
    if (error) setDataStatus(`Errore accettazione amicizia: ${error.message}`);
  }

  function sendMessage() {
    if (!isAuthenticated) {
      setAuthMode("login");
      setRegisterOpen(true);
      return;
    }
    if (!messageDraft.trim()) return;
    saveMessage(messageDraft.trim());
    setMessageDraft("");
  }

  async function saveComment(body) {
    setComments((items) => [body, ...items]);
    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return;

    const { error } = await supabase.from("comments").insert({
      colony_id: selected.id,
      body,
      created_by: currentUser.id,
    });
    if (error) setDataStatus(`Errore commento: ${error.message}`);
  }

  async function saveMessage(body) {
    const localMessage = {
      id: Date.now(),
      from: currentUser?.username ?? "Utente",
      text: body,
      time: "adesso",
    };
    setMessages((items) => [...items, localMessage]);
    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return;

    const { error } = await supabase.from("messages").insert({
      colony_id: selected.id,
      sender_id: currentUser.id,
      body,
    });
    if (error) setDataStatus(`Errore messaggio: ${error.message}`);
  }

  async function sendPrivateMessage(recipientId, body) {
    if (!isAuthenticated || !recipientId || !body.trim()) return false;
    const recipient = profiles.find((profile) => profile.id === recipientId);
    const localMessage = {
      id: `local-${Date.now()}`,
      from: currentUser.username,
      to: recipient?.username ?? "Utente",
      text: body.trim(),
      time: "adesso",
    };
    setPrivateMessages((items) => [...items, localMessage]);

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return true;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        recipient_id: recipientId,
        body: body.trim(),
      })
      .select("id,sender_id,recipient_id,body,created_at,sender:profiles!messages_sender_id_fkey(username),recipient:profiles!messages_recipient_id_fkey(username)")
      .single();

    if (error) {
      setDataStatus(`Errore messaggio privato: ${error.message}`);
      return false;
    }

    setPrivateMessages((items) => [
      ...items.filter((item) => item.id !== localMessage.id),
      {
        id: data.id,
        from: currentUser.username,
        to: data.recipient?.username ?? recipient?.username ?? "Utente",
        text: data.body,
        time: formatDate(data.created_at),
      },
    ]);
    return true;
  }

  async function requestFriend(profileId) {
    if (!isAuthenticated || !profileId || profileId === currentUser?.id) return false;
    const profile = profiles.find((item) => item.id === profileId);
    const localRequest = {
      id: `local-${Date.now()}`,
      user: profile?.username ?? "Utente",
      note: "Richiesta inviata",
      accepted: false,
      incoming: false,
      status: "pending",
    };
    setFriendRequests((items) => [localRequest, ...items]);

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return true;

    const { error } = await supabase.from("friend_requests").insert({
      from_profile_id: currentUser.id,
      to_profile_id: profileId,
      status: "pending",
    });
    if (error) {
      setDataStatus(`Errore richiesta amicizia: ${error.message}`);
      return false;
    }
    await loadSocialData();
    return true;
  }

  async function createForumThread(payload) {
    if (!isAuthenticated || !payload.title.trim()) return false;
    const thread = {
      id: `local-${Date.now()}`,
      title: payload.title.trim(),
      body: payload.body.trim(),
      category: payload.category,
      author: currentUser.username,
      time: "adesso",
      posts: [],
    };
    setForumThreads((items) => [thread, ...items]);

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return true;

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        title: thread.title,
        body: thread.body || null,
        category: thread.category,
        author_id: currentUser.id,
      })
      .select("id,title,body,category,created_at,author:profiles!forum_threads_author_id_fkey(username)")
      .single();

    if (error) {
      setDataStatus(`Errore forum: ${error.message}`);
      return false;
    }

    setForumThreads((items) => [
      {
        id: data.id,
        title: data.title,
        body: data.body,
        category: data.category,
        author: data.author?.username ?? currentUser.username,
        time: formatDate(data.created_at),
        posts: [],
      },
      ...items.filter((item) => item.id !== thread.id),
    ]);
    return true;
  }

  async function addForumPost(threadId, body) {
    if (!isAuthenticated || !body.trim()) return false;
    setForumThreads((items) =>
      items.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              posts: [
                ...(thread.posts ?? []),
                {
                  id: `local-${Date.now()}`,
                  author: currentUser.username,
                  body: body.trim(),
                  time: "adesso",
                },
              ],
            }
          : thread,
      ),
    );

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id || String(threadId).startsWith("local-")) return true;

    const { error } = await supabase.from("forum_posts").insert({
      thread_id: threadId,
      author_id: currentUser.id,
      body: body.trim(),
    });
    if (error) {
      setDataStatus(`Errore risposta forum: ${error.message}`);
      return false;
    }
    return true;
  }

  async function saveCat(catId, patch, targetColonyId = selected.id) {
    const targetColony = colonies.find((item) => item.id === targetColonyId) ?? selected;
    const canEditTarget =
      isAuthenticated &&
      (isSiteAdmin ||
        targetColony.adminId === currentUser?.id ||
        targetColony.createdBy === currentUser?.id ||
        targetColony.admin === currentUser?.username ||
        targetColony.collaborators?.includes(currentUser?.username));

    if (!canEditTarget) {
      setAuthMode("login");
      setRegisterOpen(true);
      return false;
    }

    const cleaned = {
      ...patch,
      name: patch.name?.trim() || "Senza nome",
    };
    const sterilizationYear = cleaned.sterilizationDate
      ? Number(cleaned.sterilizationDate.slice(0, 4))
      : null;

    const localPreview = cleaned.photoPreview || cleaned.photoUrl;
    const localCat = {
      ...cleaned,
      id: catId,
      colonyId: targetColony.id,
      sterilizationYear: sterilizationYear ?? "",
      photo: localPreview || cleaned.photo || catPlaceholder,
      photoUrl: localPreview || cleaned.photoUrl || "",
    };
    setCatsByColony((items) => ({
      ...items,
      [targetColony.id]: (items[targetColony.id] ?? []).map((cat) =>
        cat.id === catId ? { ...cat, ...localCat } : cat,
      ),
    }));

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return true;

    const payload = {
      colony_id: targetColony.id,
      name: cleaned.name,
      sex: cleaned.sex || null,
      status: cleaned.status || null,
      notes: cleaned.notes || null,
      sterilized: cleaned.sterilized === "" ? null : cleaned.sterilized,
      sterilization_date: cleaned.sterilizationDate || null,
      sterilization_year: sterilizationYear,
      ear_tip: Boolean(cleaned.earTip),
      provenance: cleaned.provenance || null,
      already_present: cleaned.alreadyPresent === "" ? null : cleaned.alreadyPresent,
      description: cleaned.description || null,
      approximate_birth_date: cleaned.approximateBirthDate || null,
      removal_reason: cleaned.removalReason || null,
      removed_at: cleaned.removedAt || null,
      created_by: currentUser.id,
    };

    if (cleaned.photoUrl && !cleaned.photoFile) payload.photo_url = cleaned.photoUrl;

    const query = String(catId).startsWith("local-")
      ? supabase.from("cats").insert(payload)
      : supabase.from("cats").update(payload).eq("id", catId);
    const { data, error } = await query
      .select("id,colony_id,name,sex,status,notes,sterilized,sterilization_date,sterilization_year,ear_tip,provenance,already_present,description,approximate_birth_date,removal_reason,removed_at,photo_url,created_at")
      .single();

    if (error) {
      setDataStatus(`Errore salvataggio gatto: ${error.message}`);
      return false;
    }

    let savedCat = data;

    if (cleaned.photoFile) {
      const photoUrl = await uploadPublicImage(
        supabase,
        "cat-photos",
        cleaned.photoFile,
        `cats/${savedCat.id}`,
      );
      if (photoUrl) {
        const { data: photoData, error: photoError } = await supabase
          .from("cats")
          .update({ photo_url: photoUrl })
          .eq("id", savedCat.id)
          .select("id,colony_id,name,sex,status,notes,sterilized,sterilization_date,sterilization_year,ear_tip,provenance,already_present,description,approximate_birth_date,removal_reason,removed_at,photo_url,created_at")
          .single();
        if (!photoError && photoData) savedCat = photoData;
      }
    }

    const mappedCat = mapDbCat(savedCat);
    setCatsByColony((items) => ({
      ...items,
      [targetColony.id]: (items[targetColony.id] ?? []).map((cat) =>
        cat.id === catId ? mappedCat : cat,
      ),
    }));
    await notifyAdmins("new_cat", "Nuovo gatto", `${mappedCat.name} aggiunto a ${targetColony.name}`);
    return true;
  }

  async function createCatForColony(targetColonyId, patch) {
    const tempId = `local-${Date.now()}`;
    const targetColony = colonies.find((item) => item.id === targetColonyId);
    if (!targetColony) return false;

    setCatsByColony((items) => ({
      ...items,
      [targetColonyId]: [
        {
          id: tempId,
          colonyId: targetColonyId,
          name: patch.name?.trim() || "Nuovo gatto",
          sex: patch.sex || "",
          status: patch.status || "Da verificare",
          notes: patch.notes || "",
          photo: patch.photoPreview || catPlaceholder,
        },
        ...(items[targetColonyId] ?? []),
      ],
    }));
    setColonies((items) =>
      items.map((item) =>
        item.id === targetColonyId ? { ...item, cats: item.cats + 1, updated: "adesso" } : item,
      ),
    );
    return saveCat(tempId, patch, targetColonyId);
  }

  async function createHelpRequest(payload) {
    if (!isAuthenticated) {
      setAuthMode("login");
      setRegisterOpen(true);
      return false;
    }

    const report = {
      id: `local-${Date.now()}`,
      colonyId: payload.colonyId,
      colony: colonies.find((item) => item.id === payload.colonyId)?.name ?? "Colonia",
      type: payload.type,
      status: "open",
      title: payload.title.trim(),
      description: payload.description.trim(),
      tone: payload.type === "rescue" ? "red" : payload.type === "problem" || payload.type === "birth" ? "orange" : "blue",
      createdAt: new Date().toISOString(),
    };
    if (!report.title) return false;
    setReports((items) => [report, ...items]);

    const supabase = await getSupabaseClient();
    if (!supabase || !currentUser?.id) return true;

    const { data, error } = await supabase
      .from("reports")
      .insert({
        colony_id: payload.colonyId,
        type: payload.type,
        status: "open",
        title: report.title,
        description: report.description || null,
        created_by: currentUser.id,
      })
      .select("id,colony_id,type,status,title,description,created_at,author:profiles!reports_created_by_fkey(username)")
      .single();
    if (error) {
      setDataStatus(`Errore richiesta aiuto: ${error.message}`);
      return false;
    }
    setReports((items) => [mapDbReports([data], colonies)[0], ...items.filter((item) => item.id !== report.id)]);
    if (report.type === "rescue") {
      await notifyAdmins("rescue_request", "Richiesta di soccorso", `${report.title} - ${report.colony}`);
    }
    return true;
  }

  return (
    <main className="app-shell">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} counts={menuCounts} />
      <section className="workspace">
        <Topbar
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          notifications={notifications}
          isNotificationsOpen={isNotificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAuth={() => setRegisterOpen(true)}
          onLogout={signOut}
        />
        {activeSection === "Mappa" && (
          <MapSection
            colonies={filteredColonies}
            selected={selected}
            selectedId={selectedId}
            mapBounds={mapBounds}
            onBoundsChange={setMapBounds}
            onSelect={setSelectedId}
            onOpenColony={(id) => {
              setSelectedId(id);
              setActiveSection("Colonie");
            }}
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
            isAuthenticated={isAuthenticated}
            canEdit={canEditSelected}
            onRequireAuth={() => {
              setAuthMode("login");
              setRegisterOpen(true);
            }}
            onUpdateColony={updateColony}
            cats={visibleCats}
            onSaveCat={saveCat}
            helpReports={helpReports}
            reports={reports}
            onCreateHelpRequest={createHelpRequest}
          />
        )}
        {activeSection === "Colonie" && (
          <ColoniesSection
            colonies={filteredColonies}
            selected={selected}
            selectedId={selectedId}
            dataStatus={dataStatus}
            isDataBusy={isDataBusy}
            isAuthenticated={isAuthenticated}
            canEdit={canEditSelected}
            onRequireAuth={() => {
              setAuthMode("login");
              setRegisterOpen(true);
            }}
            onSelect={setSelectedId}
            onCreateColony={createColony}
            participationRequests={participationRequests.filter(
              (request) => request.colonyId === selected.id,
            )}
            onToggleAsl={toggleAslDeclared}
            onReplaceAdmin={replaceColonyAdmin}
            onApproveParticipation={approveParticipation}
            onUpdateColony={updateColony}
            cats={visibleCats}
            onSaveCat={saveCat}
            helpReports={helpReports}
            onCreateHelpRequest={createHelpRequest}
            comments={comments}
            draft={draft}
            setDraft={setDraft}
            addComment={addComment}
          />
        )}
        {activeSection === "Gatti" && (
          <CatsSection
            colonies={colonies}
            catsByColony={catsByColony}
            canEdit={canEditSelected}
            onSaveCat={saveCat}
            onCreateCat={createCatForColony}
          />
        )}
        {activeSection === "Segnalazioni" && (
          <ReportsSection
            colonies={colonies}
            reports={reports}
            canEdit={canEditSelected}
            selected={selected}
            onCreateHelpRequest={createHelpRequest}
            isAuthenticated={isAuthenticated}
            onRequireAuth={() => {
              setAuthMode("login");
              setRegisterOpen(true);
            }}
          />
        )}
        {activeSection === "Messaggi" && isAuthenticated && (
          <MessagesSection
            profiles={profiles}
            privateMessages={privateMessages}
            onSendPrivateMessage={sendPrivateMessage}
          />
        )}
        {activeSection === "Messaggi" && !isAuthenticated && (
          <AuthRequiredPanel title="Messaggi" onRequireAuth={() => {
            setAuthMode("login");
            setRegisterOpen(true);
          }} />
        )}
        {activeSection === "Community" && isAuthenticated && (
          <CommunitySection
            colonies={colonies}
            profiles={profiles}
            participationRequests={participationRequests}
            friendRequests={friendRequests}
            forumThreads={forumThreads}
            onApproveParticipation={approveParticipation}
            onAcceptFriend={acceptFriend}
            onRequestFriend={requestFriend}
            onCreateForumThread={createForumThread}
            onAddForumPost={addForumPost}
          />
        )}
        {activeSection === "Community" && !isAuthenticated && (
          <AuthRequiredPanel title="Community" onRequireAuth={() => {
            setAuthMode("login");
            setRegisterOpen(true);
          }} />
        )}
      </section>
      <MobilePreview selected={selected} onAddCat={addCat} onReportKitten={reportKitten} canEdit={canEditSelected} />
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

function Sidebar({ activeSection, onSectionChange, counts }) {
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
            {Boolean(counts[label]) && <strong>{counts[label]}</strong>}
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

function Topbar({ currentUser, isAuthenticated, notifications, isNotificationsOpen, setNotificationsOpen, searchQuery, setSearchQuery, onOpenAuth, onLogout }) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <header className="topbar">
      <label className="search-box">
        <Search size={18} />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Cerca colonie, zone, gatti..."
        />
        <kbd>⌘K</kbd>
      </label>
      <div className="account">
        {isAuthenticated && (
          <div className="notification-wrap">
            <button
              className="icon-btn alert"
              aria-label="Notifiche"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <Bell size={19} />
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
            {isNotificationsOpen && (
              <div className="notification-popover">
                <h2>Notifiche</h2>
                {notifications.map((item) => (
                  <article key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <small>{item.time}</small>
                  </article>
                ))}
                {!notifications.length && <p>Nessuna notifica.</p>}
              </div>
            )}
          </div>
        )}
        {isAuthenticated ? (
          <>
            <PhotoImage photo={currentUser.avatar || catPhotos[4]} alt="Avatar utente" />
            <div>
              <strong>{currentUser.username}</strong>
              <small>{currentUser.role}</small>
            </div>
            <ChevronDown size={17} />
            <button className="text-action" onClick={onOpenAuth}>Account</button>
            <button className="text-action ghost" onClick={onLogout}>Esci</button>
          </>
        ) : (
          <>
            <div>
              <strong>Accesso pubblico</strong>
              <small>Mappa e schede in sola lettura</small>
            </div>
            <button className="text-action" onClick={onOpenAuth}>Accedi</button>
          </>
        )}
      </div>
    </header>
  );
}

function MapSection({
  colonies,
  selected,
  selectedId,
  mapBounds,
  onBoundsChange,
  onSelect,
  onOpenColony,
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
  isAuthenticated,
  canEdit,
  onRequireAuth,
  onUpdateColony,
  cats,
  onSaveCat,
  helpReports,
  reports,
  onCreateHelpRequest,
}) {
  const visibleColonies = mapBounds
    ? colonies.filter((colony) => mapBounds.contains([colony.lat, colony.lng]))
    : colonies;

  return (
    <div className="content-grid">
      <section className="map-column" aria-label="Mappa delle colonie">
        <MapCanvas
          colonies={colonies}
          selectedId={selectedId}
          onSelect={onSelect}
          onOpenColony={onOpenColony}
          onBoundsChange={onBoundsChange}
        />
        <OpenReportsFeed reports={reports} />
        <ColonyList colonies={visibleColonies} selectedId={selectedId} onSelect={onSelect} />
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
        isAuthenticated={isAuthenticated}
        canEdit={canEdit}
        onRequireAuth={onRequireAuth}
        onUpdateColony={onUpdateColony}
        cats={cats}
        onSaveCat={onSaveCat}
        helpReports={helpReports}
        onCreateHelpRequest={onCreateHelpRequest}
      />
    </div>
  );
}

function MapCanvas({ colonies, selectedId, onSelect, onOpenColony, onBoundsChange }) {
  const selected = colonies.find((colony) => colony.id === selectedId) ?? colonies[0];
  if (!selected) {
    return (
      <div className="map-canvas empty-state">
        <MapPin size={26} />
        <strong>Nessuna colonia trovata</strong>
      </div>
    );
  }

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
        <MapBoundsTracker onBoundsChange={onBoundsChange} />
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
              <button onClick={() => onOpenColony(colony.id)}>Apri scheda</button>
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

function OpenReportsFeed({ reports }) {
  const openReports = reports.filter((report) => report.status !== "closed").slice(0, 6);

  return (
    <section className="open-reports-feed">
      <div className="section-title compact">
        <h2>Segnalazioni aperte</h2>
      </div>
      <div className="feed-strip">
        {openReports.map((report) => (
          <article className={`report-card ${report.tone}`} key={report.id}>
            <span>{reportTypeLabel(report.type)}</span>
            <strong>{report.title}</strong>
            <small>{report.colony}{report.author ? ` · ${report.author}` : ""}</small>
          </article>
        ))}
        {!openReports.length && <p className="empty-copy">Nessuna segnalazione aperta.</p>}
      </div>
    </section>
  );
}

function reportTypeLabel(type) {
  if (type === "rescue") return "Soccorso";
  if (type === "birth") return "Cucciolata";
  if (type === "problem") return "Problema";
  return "Avvistamento";
}

function DetailPanel({
  selected,
  isAuthenticated,
  onRequireAuth,
  cats,
  helpReports,
}) {
  const openHelp = helpReports.filter((report) => report.colonyId === selected.id).slice(0, 2);

  return (
    <aside className="detail-panel compact-detail">
      <div className="detail-title">
        <span className="pin-badge">
          <MapPin size={20} />
        </span>
        <div>
          <h1>{selected.name}</h1>
          <p>{selected.zone}</p>
          <a href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">
            Apri in Google Maps
          </a>
        </div>
        <button className="status-button">{selected.status}</button>
      </div>
      <div className="quick-facts">
        <Fact icon={Cat} label="Gatti" value={selected.cats} />
        <Fact icon={PawPrint} label="Cucciolate" value={selected.kittens} />
        <Fact icon={ShieldCheck} label="ASL" value={selected.aslDeclared ? "Sì" : "No"} />
        <Fact icon={Users} label="Admin" value={selected.admin} />
      </div>
      <section className="mini-panel">
        <div className="section-title compact">
          <h2>Richieste di aiuto</h2>
        </div>
        {openHelp.length ? (
          openHelp.map((report) => (
            <article className={`report-card ${report.tone}`} key={report.id}>
              <span>{report.type === "rescue" ? "Soccorso" : "Problema"}</span>
              <strong>{report.title}</strong>
            </article>
          ))
        ) : (
          <p className="empty-copy">Nessuna richiesta aperta.</p>
        )}
      </section>
      <section className="mini-panel">
        <div className="section-title compact">
          <h2>Gatti censiti</h2>
          <span>{cats.length || selected.cats}</span>
        </div>
        <MediaStrip photos={selected.photos.slice(0, 3)} title="Foto" />
      </section>
      {!isAuthenticated && <PublicReadOnlyNotice onRequireAuth={onRequireAuth} />}
    </aside>
  );
}

function PublicReadOnlyNotice({ onRequireAuth }) {
  return (
    <section className="auth-notice">
      <strong>Visualizzazione pubblica</strong>
      <button onClick={onRequireAuth}>Accedi per modificare</button>
    </section>
  );
}

function ColonyEditPanel({ selected, onUpdateColony }) {
  const [draft, setDraft] = useState(() => makeColonyDraft(selected));
  const [status, setStatus] = useState("");
  const [isGeocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setDraft(makeColonyDraft(selected));
    setStatus("");
  }, [selected]);

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setDraft((current) => ({ ...current, [field]: value }));
  };
  const updatePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDraft((current) => ({
      ...current,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  async function geocodeAddress() {
    const query = [draft.address, draft.city, "Italia"].filter(Boolean).join(", ");
    if (!draft.address.trim() || !draft.city.trim()) {
      setStatus("Inserisci indirizzo e città.");
      return;
    }

    setGeocoding(true);
    setStatus("Ricerca coordinate...");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Servizio geocoding non disponibile.");
      const results = await response.json();
      const first = results[0];
      if (!first) {
        setStatus("Coordinate non trovate.");
        return;
      }
      setDraft((current) => ({
        ...current,
        lat: Number(first.lat).toFixed(6),
        lng: Number(first.lon).toFixed(6),
      }));
      setStatus("Coordinate aggiornate.");
    } catch (error) {
      setStatus(error.message ?? "Errore geocoding.");
    } finally {
      setGeocoding(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const saved = await onUpdateColony(selected.id, draft);
    setStatus(saved ? "Modifiche salvate." : "Salvataggio non riuscito.");
  }

  return (
    <form className="edit-panel" onSubmit={submit}>
      <div className="section-title compact">
        <h2>Modifica colonia</h2>
      </div>
      <div className="edit-grid">
        <label className="photo-field">
          Foto colonia
          <PhotoImage photo={draft.photoPreview || draft.photoUrl || colonyPlaceholder} alt="Foto colonia" />
          <input type="file" accept="image/*" onChange={updatePhoto} />
        </label>
        <label>
          Nome
          <input value={draft.name} onChange={updateField("name")} />
        </label>
        <label>
          Stato
          <select value={draft.status} onChange={updateField("status")}>
            <option>Attiva</option>
            <option>Da verificare</option>
            <option>Critica</option>
            <option>Chiusa</option>
          </select>
        </label>
        <label>
          Indirizzo
          <input value={draft.address} onChange={updateField("address")} />
        </label>
        <label>
          Città
          <input value={draft.city} onChange={updateField("city")} />
        </label>
        <label>
          Latitudine
          <input value={draft.lat} onChange={updateField("lat")} />
        </label>
        <label>
          Longitudine
          <input value={draft.lng} onChange={updateField("lng")} />
        </label>
        <button type="button" className="secondary-button" onClick={geocodeAddress} disabled={isGeocoding}>
          {isGeocoding ? "Cerco..." : "Trova coordinate"}
        </button>
        <label className="inline-check">
          <input type="checkbox" checked={draft.aslDeclared} onChange={updateField("aslDeclared")} />
          Dichiarata all'ASL
        </label>
        <label>
          Numero registro
          <input value={draft.registryNumber} onChange={updateField("registryNumber")} />
        </label>
        <label>
          Data ultimo aggiornamento
          <input type="date" value={draft.healthLastUpdated} onChange={updateField("healthLastUpdated")} />
        </label>
        <label>
          Data scheda
          <input type="date" value={draft.healthRecordDate} onChange={updateField("healthRecordDate")} />
        </label>
        <label>
          Volontario referente
          <input value={draft.volunteerName} onChange={updateField("volunteerName")} />
        </label>
        <label>
          Telefono
          <input value={draft.volunteerPhone} onChange={updateField("volunteerPhone")} />
        </label>
        <label>
          Orari
          <input value={draft.volunteerCallHours} onChange={updateField("volunteerCallHours")} />
        </label>
        {[
          ["Maschi", "totalMales"],
          ["Maschi sterilizzati", "sterilizedMales"],
          ["Maschi non sterilizzati", "unsterilizedMales"],
          ["Femmine", "totalFemales"],
          ["Femmine sterilizzate", "sterilizedFemales"],
          ["Femmine non sterilizzate", "unsterilizedFemales"],
          ["Totale sterilizzati", "totalSterilized"],
          ["Totale non sterilizzati", "totalUnsterilized"],
        ].map(([label, field]) => (
          <label key={field}>
            {label}
            <input type="number" min="0" value={draft[field]} onChange={updateField(field)} />
          </label>
        ))}
        <label className="wide-field">
          Contesto luogo
          <textarea value={draft.locationContext} onChange={updateField("locationContext")} />
        </label>
        <label className="wide-field">
          Note sanitarie
          <textarea value={draft.healthNotes} onChange={updateField("healthNotes")} />
        </label>
      </div>
      {status && <p className="form-note">{status}</p>}
      <button className="primary">Salva modifiche</button>
    </form>
  );
}

function makeColonyDraft(selected) {
  const [zoneAddress = "", zoneCity = "Napoli"] = (selected.zone ?? "").split(" - ");
  return {
    name: selected.name ?? "",
    address: selected.address ?? zoneAddress,
    city: selected.city ?? zoneCity,
    status: selected.status ?? "Attiva",
    lat: selected.lat ?? "",
    lng: selected.lng ?? "",
    aslDeclared: Boolean(selected.aslDeclared),
    registryNumber: selected.registryNumber ?? "",
    locationContext: selected.locationContext ?? "",
    healthLastUpdated: selected.healthLastUpdated ?? "",
    healthRecordDate: selected.healthRecordDate ?? "",
    volunteerName: selected.volunteerName ?? "",
    volunteerPhone: selected.volunteerPhone ?? "",
    volunteerCallHours: selected.volunteerCallHours ?? "",
    totalMales: selected.totalMales ?? 0,
    sterilizedMales: selected.sterilizedMales ?? 0,
    unsterilizedMales: selected.unsterilizedMales ?? 0,
    totalFemales: selected.totalFemales ?? 0,
    sterilizedFemales: selected.sterilizedFemales ?? 0,
    unsterilizedFemales: selected.unsterilizedFemales ?? 0,
    totalSterilized: selected.totalSterilized ?? 0,
    totalUnsterilized: selected.totalUnsterilized ?? 0,
    healthNotes: selected.healthNotes ?? "",
    photoUrl: selected.photoUrl ?? "",
    photoPreview: selected.photoUrl ?? "",
  };
}

function HelpFeed({ reports, selected, canEdit, onCreateHelpRequest }) {
  const [isCreating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    type: "rescue",
  });
  const updateField = (field) => (event) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const created = await onCreateHelpRequest({
      ...draft,
      colonyId: selected.id,
    });
    if (!created) return;
    setDraft({ title: "", description: "", type: "rescue" });
    setCreating(false);
  }

  return (
    <section className="help-feed">
      <div className="section-title compact">
        <h2>Richieste di aiuto</h2>
        {canEdit && (
          <button onClick={() => setCreating((value) => !value)}>
            <Plus size={16} />
            Nuova
          </button>
        )}
      </div>
      {isCreating && (
        <form className="inline-form" onSubmit={submit}>
          <label>
            Tipo
            <select value={draft.type} onChange={updateField("type")}>
              <option value="rescue">Soccorso</option>
              <option value="problem">Problema</option>
            </select>
          </label>
          <label>
            Titolo
            <input value={draft.title} onChange={updateField("title")} />
          </label>
          <label className="wide-field">
            Dettagli
            <textarea value={draft.description} onChange={updateField("description")} />
          </label>
          <button className="primary">Pubblica richiesta</button>
        </form>
      )}
      {reports.length ? (
        reports.slice(0, 4).map((report) => (
          <article className={`report-card ${report.tone}`} key={report.id}>
            <span>{report.type === "rescue" ? "Soccorso" : "Problema"}</span>
            <strong>{report.title}</strong>
            {report.description && <small>{report.description}</small>}
          </article>
        ))
      ) : (
        <p className="empty-copy">Nessuna richiesta aperta.</p>
      )}
    </section>
  );
}

function CatEditPanel({ cat, onSaveCat }) {
  const [draft, setDraft] = useState(() => makeCatDraft(cat));
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(makeCatDraft(cat));
    setStatus("");
  }, [cat]);

  const updateField = (field) => (event) => {
    const { type, checked, value } = event.target;
    setDraft((current) => ({
      ...current,
      [field]: type === "checkbox" ? checked : value,
    }));
  };
  const updatePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDraft((current) => ({
      ...current,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  async function submit(event) {
    event.preventDefault();
    try {
      const saved = await onSaveCat(cat.id, draft);
      setStatus(saved ? "Scheda gatto salvata." : "Salvataggio non riuscito.");
    } catch (error) {
      setStatus(error.message ?? "Salvataggio non riuscito.");
    }
  }

  return (
    <form className="edit-panel" onSubmit={submit}>
      <div className="section-title compact">
        <h2>Modifica gatto</h2>
      </div>
      <div className="edit-grid">
        <label className="photo-field">
          Foto gatto
          <PhotoImage photo={draft.photoPreview || draft.photoUrl || catPlaceholder} alt="Foto gatto" />
          <input type="file" accept="image/*" onChange={updatePhoto} />
        </label>
        <label>
          Nome
          <input value={draft.name} onChange={updateField("name")} />
        </label>
        <label>
          Sesso
          <select value={draft.sex} onChange={updateField("sex")}>
            <option value="">Da verificare</option>
            <option>Maschio</option>
            <option>Femmina</option>
          </select>
        </label>
        <label>
          Stato
          <input value={draft.status} onChange={updateField("status")} />
        </label>
        <label>
          Data sterilizzazione
          <input type="date" value={draft.sterilizationDate} onChange={updateField("sterilizationDate")} />
        </label>
        <label className="inline-check">
          <input type="checkbox" checked={draft.sterilized === true} onChange={(event) => setDraft((current) => ({ ...current, sterilized: event.target.checked }))} />
          Sterilizzato
        </label>
        <label className="inline-check">
          <input type="checkbox" checked={draft.earTip} onChange={updateField("earTip")} />
          Taglio padiglione
        </label>
        <label>
          Provenienza
          <input value={draft.provenance} onChange={updateField("provenance")} />
        </label>
        <label className="wide-field">
          Descrizione
          <textarea value={draft.description} onChange={updateField("description")} />
        </label>
        <label className="wide-field">
          Note
          <textarea value={draft.notes} onChange={updateField("notes")} />
        </label>
        <label>
          Nascita presunta
          <input type="date" value={draft.approximateBirthDate} onChange={updateField("approximateBirthDate")} />
        </label>
        <label>
          Motivo cancellazione
          <input value={draft.removalReason} onChange={updateField("removalReason")} />
        </label>
        <label>
          Data cancellazione
          <input type="date" value={draft.removedAt} onChange={updateField("removedAt")} />
        </label>
      </div>
      {status && <p className="form-note">{status}</p>}
      <button className="primary">Salva scheda gatto</button>
    </form>
  );
}

function makeCatDraft(cat) {
  return {
    name: cat.name ?? "",
    sex: cat.sex ?? "",
    status: cat.status ?? "",
    notes: cat.notes ?? "",
    sterilized: cat.sterilized ?? "",
    sterilizationDate: cat.sterilizationDate ?? "",
    sterilizationYear: cat.sterilizationDate ? Number(cat.sterilizationDate.slice(0, 4)) : cat.sterilizationYear ?? "",
    photoUrl: cat.photoUrl ?? "",
    photoPreview: cat.photoUrl || cat.photo || "",
    earTip: Boolean(cat.earTip),
    provenance: cat.provenance ?? "",
    alreadyPresent: cat.alreadyPresent ?? "",
    description: cat.description ?? "",
    approximateBirthDate: cat.approximateBirthDate ?? "",
    removalReason: cat.removalReason ?? "",
    removedAt: cat.removedAt ?? "",
  };
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
    ...seedUsers.map((user) => user.username),
  ];

  return (
    <section className="admin-panel">
      <div className="section-title compact">
        <h2>Gestione permessi</h2>
      </div>
      <div className="admin-grid">
        <article className="super-admin">
          <span>Admin sito</span>
          <strong>site_admin</strong>
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

function SanitaryPanel({ selected }) {
  const totals = [
    ["Maschi", selected.totalMales ?? 0],
    ["Maschi sterilizzati", selected.sterilizedMales ?? 0],
    ["Maschi non sterilizzati", selected.unsterilizedMales ?? 0],
    ["Femmine", selected.totalFemales ?? 0],
    ["Femmine sterilizzate", selected.sterilizedFemales ?? 0],
    ["Femmine non sterilizzate", selected.unsterilizedFemales ?? 0],
    ["Totale sterilizzati", selected.totalSterilized ?? 0],
    ["Totale non sterilizzati", selected.totalUnsterilized ?? 0],
  ];

  return (
    <section className="sanitary-panel">
      <div className="section-title compact">
        <h2>Scheda sanitaria colonia</h2>
        <span>{selected.registryNumber || "Registro non assegnato"}</span>
      </div>
      <div className="sanitary-grid">
        <Fact icon={Clock3} label="Ultimo aggiornamento" value={selected.healthLastUpdated || "Da inserire"} />
        <Fact icon={ShieldCheck} label="Data scheda" value={selected.healthRecordDate || "Da inserire"} />
        <Fact icon={Users} label="Volontario" value={selected.volunteerName || selected.caretaker || "Da inserire"} />
        <Fact icon={Phone} label="Telefono/orari" value={selected.volunteerPhone || selected.volunteerCallHours || "Da inserire"} />
      </div>
      <div className="health-totals">
        {totals.map(([label, value]) => (
          <span key={label}>
            <strong>{value}</strong>
            {label}
          </span>
        ))}
      </div>
      {(selected.locationContext || selected.healthNotes || selected.sourceUrl) && (
        <p className="health-notes">
          {selected.locationContext && <span>{selected.locationContext}</span>}
          {selected.healthNotes && <span>{selected.healthNotes}</span>}
          {selected.sourceUrl && (
            <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
              Fonte: {selected.sourceLabel || selected.sourceUrl}
            </a>
          )}
        </p>
      )}
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
  selected,
  selectedId,
  dataStatus,
  isDataBusy,
  isAuthenticated,
  canEdit,
  onRequireAuth,
  onSelect,
  onCreateColony,
  participationRequests,
  onToggleAsl,
  onReplaceAdmin,
  onApproveParticipation,
  onUpdateColony,
  cats,
  onSaveCat,
  helpReports,
  onCreateHelpRequest,
  comments,
  draft,
  setDraft,
  addComment,
}) {
  const [isCreating, setCreating] = useState(false);
  const [newColony, setNewColony] = useState({
    name: "",
    address: "",
    city: "",
    lat: "",
    lng: "",
    aslDeclared: false,
    registryNumber: "",
    locationContext: "",
    healthLastUpdated: "",
    healthRecordDate: "",
    volunteerName: "",
    volunteerPhone: "",
    volunteerCallHours: "",
    healthNotes: "",
    photoFile: null,
    photoPreview: "",
  });
  const [geocodeStatus, setGeocodeStatus] = useState("");
  const [isGeocoding, setGeocoding] = useState(false);
  const declaredCount = colonies.filter((colony) => colony.aslDeclared).length;
  const totalCats = colonies.reduce((sum, colony) => sum + colony.cats, 0);
  const updateField = (field) => (event) => {
    const value = field === "aslDeclared" ? event.target.checked : event.target.value;
    setNewColony((current) => ({ ...current, [field]: value }));
  };
  const updateNewPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setNewColony((current) => ({
      ...current,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
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
      registryNumber: "",
      locationContext: "",
      healthLastUpdated: "",
      healthRecordDate: "",
      volunteerName: "",
      volunteerPhone: "",
      volunteerCallHours: "",
      healthNotes: "",
      photoFile: null,
      photoPreview: "",
    });
    setCreating(false);
  }

  async function geocodeAddress() {
    const query = [newColony.address, newColony.city, "Italia"]
      .filter(Boolean)
      .join(", ");

    if (!newColony.address.trim() || !newColony.city.trim()) {
      setGeocodeStatus("Inserisci indirizzo e città prima del geocoding.");
      return;
    }

    setGeocoding(true);
    setGeocodeStatus("Ricerca coordinate...");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Servizio geocoding non disponibile.");
      const results = await response.json();
      const first = results[0];
      if (!first) {
        setGeocodeStatus("Nessuna coordinata trovata. Inseriscile manualmente.");
        return;
      }
      setNewColony((current) => ({
        ...current,
        lat: Number(first.lat).toFixed(6),
        lng: Number(first.lon).toFixed(6),
      }));
      setGeocodeStatus(`Coordinate trovate: ${first.display_name}`);
    } catch (error) {
      setGeocodeStatus(error.message ?? "Errore geocoding.");
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        title="Colonie"
        action="Nuova colonia"
        onAction={() => (isAuthenticated ? setCreating((value) => !value) : onRequireAuth())}
      />
      <div className={isDataBusy ? "data-banner loading" : "data-banner"}>
        {isDataBusy ? "Sincronizzazione dati..." : dataStatus}
      </div>
      {isCreating && (
        <form className="create-panel" onSubmit={submitColony}>
          <label className="photo-field">
            Foto colonia
            <PhotoImage photo={newColony.photoPreview || colonyPlaceholder} alt="Foto colonia" />
            <input type="file" accept="image/*" onChange={updateNewPhoto} />
          </label>
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
          <button type="button" className="secondary-button" onClick={geocodeAddress} disabled={isGeocoding}>
            {isGeocoding ? "Cerco..." : "Trova coordinate"}
          </button>
          {geocodeStatus && <p className="form-note">{geocodeStatus}</p>}
          <label>
            Numero registro
            <input
              value={newColony.registryNumber}
              onChange={updateField("registryNumber")}
              placeholder="es. NA-001"
            />
          </label>
          <label>
            Contesto luogo
            <input
              value={newColony.locationContext}
              onChange={updateField("locationContext")}
              placeholder="giardino, cortile, area pubblica..."
            />
          </label>
          <label>
            Data ultimo aggiornamento sanitario
            <input
              type="date"
              value={newColony.healthLastUpdated}
              onChange={updateField("healthLastUpdated")}
            />
          </label>
          <label>
            Data scheda colonia
            <input
              type="date"
              value={newColony.healthRecordDate}
              onChange={updateField("healthRecordDate")}
            />
          </label>
          <label>
            Volontario referente
            <input
              value={newColony.volunteerName}
              onChange={updateField("volunteerName")}
              placeholder="nome e cognome"
            />
          </label>
          <label>
            Telefono volontario
            <input
              value={newColony.volunteerPhone}
              onChange={updateField("volunteerPhone")}
              placeholder="numero e orari"
            />
          </label>
          <label>
            Orari telefonici
            <input
              value={newColony.volunteerCallHours}
              onChange={updateField("volunteerCallHours")}
              placeholder="es. 18:00 - 20:00"
            />
          </label>
          <label>
            Note sanitarie
            <input
              value={newColony.healthNotes}
              onChange={updateField("healthNotes")}
              placeholder="sterilizzazioni, sopralluoghi, criticità"
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
            <button onClick={() => onSelect(colony.id)}>
              {colony.id === selectedId ? "Aperta" : "Apri"}
            </button>
          </div>
        ))}
      </div>
      <ColonyFullPanel
        selected={selected}
        isAuthenticated={isAuthenticated}
        canEdit={canEdit}
        onRequireAuth={onRequireAuth}
        participationRequests={participationRequests}
        onToggleAsl={onToggleAsl}
        onReplaceAdmin={onReplaceAdmin}
        onApproveParticipation={onApproveParticipation}
        onUpdateColony={onUpdateColony}
        cats={cats}
        onSaveCat={onSaveCat}
        helpReports={helpReports}
        onCreateHelpRequest={onCreateHelpRequest}
      />
    </section>
  );
}

function ColonyFullPanel({
  selected,
  isAuthenticated,
  canEdit,
  onRequireAuth,
  participationRequests,
  onToggleAsl,
  onReplaceAdmin,
  onApproveParticipation,
  onUpdateColony,
  cats,
  onSaveCat,
  helpReports,
  onCreateHelpRequest,
  comments,
  draft,
  setDraft,
  addComment,
}) {
  const [activeTab, setActiveTab] = useState("Scheda");
  const tabs = ["Scheda", "Permessi", "Sanitario", "Foto e gatti", "Discussione"];

  return (
    <section className="colony-full-panel">
      <div className="detail-title">
        <span className="pin-badge">
          <MapPin size={20} />
        </span>
        <div>
          <h1>{selected.name}</h1>
          <p>{selected.zone}</p>
          <a href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">
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
        <Fact icon={ShieldCheck} label="Dichiarata all'ASL" value={selected.aslDeclared ? "Sì" : "No"} />
      </div>
      {!isAuthenticated && <PublicReadOnlyNotice onRequireAuth={onRequireAuth} />}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "Scheda" && (
        canEdit ? <ColonyEditPanel selected={selected} onUpdateColony={onUpdateColony} /> : <SanitaryPanel selected={selected} />
      )}
      {activeTab === "Permessi" && canEdit && (
        <AdminPanel
          selected={selected}
          participationRequests={participationRequests}
          onToggleAsl={onToggleAsl}
          onReplaceAdmin={onReplaceAdmin}
          onApproveParticipation={onApproveParticipation}
        />
      )}
      {activeTab === "Sanitario" && <SanitaryPanel selected={selected} />}
      {activeTab === "Foto e gatti" && (
        <>
          <MediaStrip photos={selected.photos} title="Foto della colonia" />
          <section className="cats-section">
            <div className="section-title">
              <h2>Gatti della colonia ({cats.length || selected.cats})</h2>
            </div>
            {cats.length > 0 ? (
              <div className="cat-cards">
                {cats.map((cat) => (
                  <article className="cat-card" key={cat.id}>
                    <PhotoImage photo={cat.photo} alt={cat.name} />
                    <strong>{cat.name}</strong>
                    <span>{cat.sex}</span>
                    <small>{cat.notes || cat.status}</small>
                    <ShieldCheck size={18} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Cat size={26} />
                <strong>Nessun gatto censito</strong>
              </div>
            )}
          </section>
          {canEdit && cats.length > 0 && <CatEditPanel cat={cats[0]} onSaveCat={onSaveCat} />}
        </>
      )}
      {activeTab === "Discussione" && (
        <>
          <HelpFeed reports={helpReports} selected={selected} canEdit={canEdit} onCreateHelpRequest={onCreateHelpRequest} />
          <ColonyDiscussionPanel
            isAuthenticated={isAuthenticated}
            comments={comments}
            draft={draft}
            setDraft={setDraft}
            addComment={addComment}
          />
        </>
      )}
    </section>
  );
}

function ColonyDiscussionPanel({
  isAuthenticated,
  comments = [],
  draft = "",
  setDraft = () => {},
  addComment = () => {},
}) {
  return (
    <section className="comments colony-discussion">
      <h2>Messaggi colonia</h2>
      {isAuthenticated && (
        <div className="comment-input">
          <PhotoImage photo={catPlaceholder} alt="" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addComment()}
            placeholder="Scrivi un messaggio sulla colonia..."
          />
          <button aria-label="Carica foto">
            <Camera size={17} />
          </button>
          <button onClick={addComment}>Invia</button>
        </div>
      )}
      {!comments.length && <p className="empty-copy">Nessun messaggio sulla colonia.</p>}
      {comments.map((comment, index) => (
        <article className="comment" key={`${comment}-${index}`}>
          <PhotoImage photo={catPlaceholder} alt="" />
          <div>
            <strong>Utente</strong>
            <span>{index === 0 ? "adesso" : "oggi"}</span>
            <p>{comment}</p>
            {isAuthenticated && <button>Rispondi</button>}
          </div>
        </article>
      ))}
    </section>
  );
}

function CatCreatePanel({ colonies, onCreateCat, onDone }) {
  const [draft, setDraft] = useState({
    colonyId: colonies[0]?.id ?? "",
    name: "",
    sex: "",
    status: "Da verificare",
    notes: "",
    sterilized: "",
    sterilizationDate: "",
    earTip: false,
    provenance: "",
    description: "",
    approximateBirthDate: "",
    photoFile: null,
    photoPreview: "",
  });
  const [status, setStatus] = useState("");

  const updateField = (field) => (event) => {
    const { type, checked, value } = event.target;
    setDraft((current) => ({ ...current, [field]: type === "checkbox" ? checked : value }));
  };
  const updatePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDraft((current) => ({
      ...current,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  async function submit(event) {
    event.preventDefault();
    const created = await onCreateCat(draft.colonyId, draft);
    if (!created) {
      setStatus("Creazione non riuscita.");
      return;
    }
    setStatus("Gatto creato.");
    onDone();
  }

  return (
    <form className="edit-panel" onSubmit={submit}>
      <div className="section-title compact">
        <h2>Nuovo gatto</h2>
      </div>
      <div className="edit-grid">
        <label className="photo-field">
          Foto gatto
          <PhotoImage photo={draft.photoPreview || catPlaceholder} alt="Foto gatto" />
          <input type="file" accept="image/*" onChange={updatePhoto} />
        </label>
        <label>
          Colonia
          <select value={draft.colonyId} onChange={updateField("colonyId")}>
            {colonies.map((colony) => (
              <option key={colony.id} value={colony.id}>{colony.name}</option>
            ))}
          </select>
        </label>
        <label>
          Nome
          <input value={draft.name} onChange={updateField("name")} />
        </label>
        <label>
          Sesso
          <select value={draft.sex} onChange={updateField("sex")}>
            <option value="">Da verificare</option>
            <option>Maschio</option>
            <option>Femmina</option>
          </select>
        </label>
        <label>
          Stato
          <input value={draft.status} onChange={updateField("status")} />
        </label>
        <label>
          Data sterilizzazione
          <input type="date" value={draft.sterilizationDate} onChange={updateField("sterilizationDate")} />
        </label>
        <label className="inline-check">
          <input type="checkbox" checked={draft.sterilized === true} onChange={(event) => setDraft((current) => ({ ...current, sterilized: event.target.checked }))} />
          Sterilizzato
        </label>
        <label className="inline-check">
          <input type="checkbox" checked={draft.earTip} onChange={updateField("earTip")} />
          Taglio padiglione
        </label>
        <label className="wide-field">
          Note
          <textarea value={draft.notes} onChange={updateField("notes")} />
        </label>
      </div>
      {status && <p className="form-note">{status}</p>}
      <button className="primary">Salva gatto</button>
    </form>
  );
}

function CatsSection({ colonies, catsByColony, canEdit, onSaveCat, onCreateCat }) {
  const registryCats = colonies.flatMap((colony) =>
    (catsByColony[colony.id] ?? []).map((cat, index) => ({
      ...cat,
      id: cat.id ?? `${colony.id}-${cat.name}-${index}`,
      colony: colony.name,
      zone: colony.zone,
      lastSeen: index === 0 ? "oggi" : "questa settimana",
    })),
  );
  const [editingCat, setEditingCat] = useState(null);
  const [isCreating, setCreating] = useState(false);

  return (
    <section className="page-section">
      <PageHeader
        title="Gatti"
        action="Aggiungi gatto"
        onAction={() => setCreating((value) => !value)}
      />
      {isCreating && (
        <CatCreatePanel
          colonies={colonies}
          onCreateCat={onCreateCat}
          onDone={() => setCreating(false)}
        />
      )}
      <div className="registry-grid">
        {registryCats.map((cat) => (
          <article className="registry-card" key={cat.id}>
            <PhotoImage photo={cat.photo} alt={cat.name} />
            <div>
              <strong>{cat.name}</strong>
              <span>{cat.sex || "Sesso da verificare"} · {cat.notes || cat.status || "Scheda aperta"}</span>
              <small>{cat.colony}</small>
              <em>Ultimo avvistamento: {cat.lastSeen}</em>
            </div>
            {canEdit && <button onClick={() => setEditingCat(cat)}>Modifica</button>}
          </article>
        ))}
      </div>
      {canEdit && editingCat && <CatEditPanel cat={editingCat} onSaveCat={onSaveCat} />}
      {!registryCats.length && <p className="empty-copy">Nessun gatto censito nel database.</p>}
    </section>
  );
}

function ReportsSection({ colonies, reports, canEdit, selected, onCreateHelpRequest, isAuthenticated, onRequireAuth }) {
  const columns = [
    ["open", "Aperta"],
    ["checking", "Da verificare"],
    ["in_progress", "In corso"],
  ];
  const [isCreating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    colonyId: selected.id,
    type: "sighting",
    title: "",
    description: "",
  });
  useEffect(() => {
    setDraft((current) => ({ ...current, colonyId: selected.id }));
  }, [selected.id]);

  const updateField = (field) => (event) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const created = await onCreateHelpRequest(draft);
    if (!created) return;
    setDraft({ colonyId: selected.id, type: "sighting", title: "", description: "" });
    setCreating(false);
  }

  return (
    <section className="page-section">
      <PageHeader
        title="Segnalazioni"
        action="Nuova segnalazione"
        onAction={() => (isAuthenticated ? setCreating((value) => !value) : onRequireAuth())}
      />
      {isCreating && (
        <form className="create-panel" onSubmit={submit}>
          <label>
            Colonia
            <select value={draft.colonyId} onChange={updateField("colonyId")}>
              {colonies.map((colony) => (
                <option key={colony.id} value={colony.id}>{colony.name}</option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select value={draft.type} onChange={updateField("type")}>
              <option value="sighting">Avvistamento</option>
              <option value="birth">Cucciolata</option>
              <option value="problem">Problema</option>
              <option value="rescue">Soccorso</option>
            </select>
          </label>
          <label>
            Titolo
            <input value={draft.title} onChange={updateField("title")} />
          </label>
          <label className="wide-field">
            Dettagli
            <textarea value={draft.description} onChange={updateField("description")} />
          </label>
          <button className="primary">Salva segnalazione</button>
        </form>
      )}
      <div className="kanban-grid">
        {columns.map(([status, label]) => (
          <div className="kanban-column" key={status}>
            <h2>{label}</h2>
            {reports
              .filter((report) => report.status === status)
              .map((report) => (
                <article className={`report-card ${report.tone}`} key={report.id}>
                  <span>{reportTypeLabel(report.type)}</span>
                  <strong>{report.title}</strong>
                  <small>{report.colony}</small>
                  {canEdit && <button>Gestisci</button>}
                </article>
              ))}
            {!reports.some((report) => report.status === status) && <p className="empty-copy">Nessuna voce.</p>}
          </div>
        ))}
      </div>
      <small className="section-note">Colonie monitorate: {colonies.length}</small>
    </section>
  );
}

function MessagesSection({ profiles, privateMessages, onSendPrivateMessage }) {
  const [recipientId, setRecipientId] = useState(profiles[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!recipientId && profiles[0]?.id) setRecipientId(profiles[0].id);
  }, [profiles, recipientId]);

  async function submit(event) {
    event.preventDefault();
    const sent = await onSendPrivateMessage(recipientId, draft);
    if (sent) setDraft("");
  }

  return (
    <section className="page-section">
      <PageHeader title="Messaggi" action="Nuovo messaggio" />
      <div className="messages-layout">
        <form className="social-card message-compose" onSubmit={submit}>
          <h2>Messaggio privato</h2>
          <label>
            Destinatario
            <select value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>
              <option value="">Seleziona utente</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.username}</option>
              ))}
            </select>
          </label>
          <label>
            Testo
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <button className="primary">Invia</button>
        </form>
        <section className="social-card">
          <h2>Conversazioni</h2>
          <div className="message-list direct-list">
            {privateMessages.map((message) => (
              <article key={message.id}>
                <strong>{message.from}</strong>
                <span>{message.time}</span>
                <p>{message.text}</p>
                <small>A: {message.to}</small>
              </article>
            ))}
            {!privateMessages.length && <p className="empty-copy">Nessun messaggio privato.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

function CommunitySection({
  colonies,
  profiles,
  participationRequests,
  friendRequests,
  forumThreads,
  onApproveParticipation,
  onAcceptFriend,
  onRequestFriend,
  onCreateForumThread,
  onAddForumPost,
}) {
  return (
    <section className="page-section">
      <PageHeader title="Community" action="Invita utente" />
      <ForumPanel threads={forumThreads} onCreateThread={onCreateForumThread} onAddPost={onAddForumPost} />
      <div className="community-grid">
        <div className="table-panel">
          <h2>Utenti</h2>
          {profiles.map((profile) => (
            <article className="request-row" key={profile.id}>
              <div>
                <strong>{profile.username}</strong>
                <p>{profile.email}</p>
                <small>{profile.role}</small>
              </div>
              <button onClick={() => onRequestFriend(profile.id)}>Amicizia</button>
            </article>
          ))}
          {!profiles.length && <p className="empty-copy padded">Nessun altro utente registrato.</p>}
        </div>
        <div className="table-panel">
          <h2>Amicizie</h2>
          {friendRequests.map((request) => (
            <article className="request-row" key={request.id}>
              <div>
                <strong>{request.user}</strong>
                <p>{request.note}</p>
                <small>{request.accepted ? "Accettata" : "In attesa"}</small>
              </div>
              {request.incoming && (
                <button disabled={request.accepted} onClick={() => onAcceptFriend(request.id)}>
                  {request.accepted ? "Amica" : "Accetta"}
                </button>
              )}
            </article>
          ))}
          {!friendRequests.length && <p className="empty-copy padded">Nessuna richiesta di amicizia.</p>}
        </div>
      </div>
      <div className="table-panel">
        <h2>Richieste di partecipazione colonie</h2>
        {participationRequests.map((request) => {
          const colony = colonies.find((item) => item.id === request.colonyId);
          return (
            <article className="request-row" key={request.id}>
              <div>
                <strong>{request.user}</strong>
                <p>{request.message}</p>
                <small>{colony?.name ?? "Colonia non trovata"} ? {request.status}</small>
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
        {!participationRequests.length && <p className="empty-copy padded">Nessuna richiesta di partecipazione.</p>}
      </div>
    </section>
  );
}

function ForumPanel({ threads, onCreateThread, onAddPost }) {
  const [draft, setDraft] = useState({ title: "", body: "", category: "Generale" });
  const [replyDrafts, setReplyDrafts] = useState({});

  async function submitThread(event) {
    event.preventDefault();
    const created = await onCreateThread(draft);
    if (created) setDraft({ title: "", body: "", category: "Generale" });
  }

  async function submitReply(threadId) {
    const sent = await onAddPost(threadId, replyDrafts[threadId] ?? "");
    if (sent) setReplyDrafts((items) => ({ ...items, [threadId]: "" }));
  }

  return (
    <section className="forum-panel">
      <form className="social-card forum-compose" onSubmit={submitThread}>
        <h2>Forum</h2>
        <div className="forum-form-grid">
          <label>
            Categoria
            <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
              <option>Generale</option>
              <option>Salute</option>
              <option>Turni</option>
              <option>Adozioni</option>
              <option>Emergenze</option>
            </select>
          </label>
          <label>
            Titolo thread
            <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="wide-field">
            Testo
            <textarea value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} />
          </label>
        </div>
        <button className="primary">Apri thread</button>
      </form>
      <div className="forum-thread-list">
        {threads.map((thread) => (
          <article className="forum-thread" key={thread.id}>
            <span>{thread.category}</span>
            <strong>{thread.title}</strong>
            {thread.body && <p>{thread.body}</p>}
            <small>{thread.author} ? {thread.time}</small>
            {(thread.posts ?? []).map((post) => (
              <div className="forum-post" key={post.id}>
                <strong>{post.author}</strong>
                <p>{post.body}</p>
              </div>
            ))}
            <div className="message-input">
              <input
                value={replyDrafts[thread.id] ?? ""}
                onChange={(event) => setReplyDrafts((items) => ({ ...items, [thread.id]: event.target.value }))}
                placeholder="Rispondi al thread..."
              />
              <button onClick={() => submitReply(thread.id)}>
                <MessageCircle size={17} />
                Rispondi
              </button>
            </div>
          </article>
        ))}
        {!threads.length && <p className="empty-copy">Nessun thread aperto.</p>}
      </div>
    </section>
  );
}

function PageHeader({ title, description, action, onAction }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && (
        <button onClick={onAction}>
          <Plus size={18} />
          {action}
        </button>
      )}
    </header>
  );
}

function AuthRequiredPanel({ title, onRequireAuth }) {
  return (
    <section className="page-section">
      <PageHeader title={title} />
      <div className="auth-notice large">
        <strong>Accesso richiesto</strong>
        <button onClick={onRequireAuth}>Accedi</button>
      </div>
    </section>
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
            placeholder="es. ilaria_nappino"
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          value={authForm.email}
          onChange={updateField("email")}
          placeholder="es. nome@example.com"
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

function MobilePreview({ selected, onAddCat, onReportKitten, canEdit }) {
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
      {canEdit && (
        <div className="phone-actions">
          <button onClick={onAddCat}>Aggiungi un gatto</button>
          <button>Segnala avvistamento</button>
          <button onClick={onReportKitten}>Segnala cucciolata</button>
          <button>Richiedi aiuto</button>
        </div>
      )}
    </aside>
  );
}

function PhotoImage({ photo, alt }) {
  return <img src={photo || catPlaceholder} alt={alt} />;
}

createRoot(document.getElementById("root")).render(<App />);

