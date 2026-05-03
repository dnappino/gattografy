import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bell, Cat, MapPin, Menu, PawPrint, Plus, Send, UserRound, X } from "lucide-react";
import { DivIcon } from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./mobile.css";
import { getSupabaseClient } from "./lib/supabase";

const catPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="20" fill="#f7fbf8"/><circle cx="120" cy="126" r="72" fill="#e1f1e8"/><path d="M72 102 83 58l31 30h12l31-30 11 44c17 13 27 34 27 58 0 36-30 62-75 62s-75-26-75-62c0-24 10-45 27-58Z" fill="#2f7a5f"/></svg>',
  );

const colonyPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="20" fill="#f6fafc"/><circle cx="120" cy="112" r="74" fill="#e4eef6"/><path d="M120 206s58-48 58-104a58 58 0 0 0-116 0c0 56 58 104 58 104Z" fill="#3d789f"/></svg>',
  );

const markerIcon = new DivIcon({
  className: "leaflet-cat-marker",
  html: '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#d7664f" d="M12 22s7-5.1 7-12a7 7 0 0 0-14 0c0 6.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.8" fill="#fff"/></svg></span>',
  iconSize: [36, 36],
  iconAnchor: [18, 30],
});

const mapDbColony = (row) => ({
  id: row.id,
  name: row.name,
  zone: `${row.address ?? ""}${row.city ? ` - ${row.city}` : ""}`,
  lat: Number(row.lat),
  lng: Number(row.lng),
  cats: row.cat_count ?? 0,
  kittens: 0,
  aslDeclared: Boolean(row.asl_declared),
  photo: row.photo_url || colonyPlaceholder,
});

const mapDbCat = (row) => ({
  id: row.id,
  colonyId: row.colony_id,
  name: row.name ?? "Gatto",
  sex: row.sex ?? "",
  notes: row.notes ?? "",
  photo: row.photo_url || catPlaceholder,
});

const isValidCoord = (item) => Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng));

async function uploadPublicImage(supabase, bucket, file, folderPrefix) {
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const filePath = `${folderPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

function App() {
  const [tab, setTab] = useState("home");
  const [sessionUser, setSessionUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showColonyDetail, setShowColonyDetail] = useState(false);
  const [status, setStatus] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [colonies, setColonies] = useState([]);
  const [cats, setCats] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction] = useState("");
  const selected = useMemo(() => colonies.find((c) => c.id === selectedId) ?? colonies[0], [colonies, selectedId]);

  useEffect(() => {
    let unsub = null;
    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus("Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
        return;
      }
      const { data } = await supabase.auth.getSession();
      setSessionUser(data.session?.user ?? null);
      await loadColonies();
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSessionUser(session?.user ?? null);
      });
      unsub = authListener.subscription.unsubscribe;
    })();
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!selected?.id) return;
    loadCats(selected.id);
  }, [selected?.id]);

  useEffect(() => {
    if (!sessionUser?.id) {
      setNotifications([]);
      return;
    }
    loadNotifications(sessionUser.id);
  }, [sessionUser?.id]);

  async function loadColonies() {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("colonies")
      .select("id,name,address,city,lat,lng,asl_declared,photo_url,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setStatus(error.message);
      return;
    }
    const mapped = (data ?? []).map(mapDbColony).filter(isValidCoord);

    // Compute cat counts without fetching all cat details.
    const { data: catRows, error: catError } = await supabase.from("cats").select("id,colony_id");
    if (!catError) {
      const counts = (catRows ?? []).reduce((acc, row) => {
        acc[row.colony_id] = (acc[row.colony_id] ?? 0) + 1;
        return acc;
      }, {});
      mapped.forEach((colony) => {
        colony.cats = counts[colony.id] ?? colony.cats ?? 0;
      });
    }

    setColonies(mapped);
    if (mapped[0]) setSelectedId((current) => current || mapped[0].id);
  }

  async function loadCats(colonyId) {
    const supabase = await getSupabaseClient();
    if (!supabase || !colonyId) return;
    const { data, error } = await supabase
      .from("cats")
      .select("id,colony_id,name,sex,notes,photo_url,created_at")
      .eq("colony_id", colonyId)
      .order("created_at", { ascending: false });
    if (error) return;
    const nextCats = (data ?? []).map(mapDbCat);
    setCats(nextCats);
    setColonies((items) =>
      items.map((item) => (item.id === colonyId ? { ...item, cats: nextCats.length } : item)),
    );
  }

  async function loadNotifications(userId) {
    const supabase = await getSupabaseClient();
    if (!supabase || !userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,body,is_read,created_at,type")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) return;
    setNotifications((data ?? []).map((item) => ({
      id: item.id,
      title: item.title || "Notifica",
      body: item.body || "",
      read: Boolean(item.is_read),
      type: item.type || "",
      time: item.created_at,
    })));
  }

  async function markNotificationRead(notificationId) {
    const supabase = await getSupabaseClient();
    setNotifications((items) => items.map((item) => (item.id === notificationId ? { ...item, read: true } : item)));
    if (!supabase || !sessionUser?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("recipient_id", sessionUser.id);
  }

  async function markAllNotificationsRead() {
    const supabase = await getSupabaseClient();
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    if (!supabase || !sessionUser?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", sessionUser.id)
      .eq("is_read", false);
  }

  async function requireAuth(actionFn) {
    if (!sessionUser?.id) {
      setShowLogin(true);
      return;
    }
    await actionFn();
  }

  async function logout() {
    const supabase = await getSupabaseClient();
    try {
      await supabase?.auth.signOut();
    } finally {
      setSessionUser(null);
      setNotifications([]);
      setCats([]);
      setShowMenu(false);
      setShowNotifications(false);
      setShowColonyDetail(false);
      setShowLogin(false);
      setTab("home");
      setStatus("");
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;
  const visibleNotifications = notifications.filter((item) => !item.read);
  const openFromMenu = (nextTab) => {
    setShowMenu(false);
    setTab(nextTab);
  };

  return (
    <main className="mobile-app">
      <section className="mobile-card mobile-topbar">
        <button className="icon-button" onClick={() => setShowMenu(true)}>
          <Menu size={18} />
        </button>
        <span className="brand"><Cat size={18} /> gattografy</span>
        <button className="icon-button bell-button" onClick={() => (sessionUser?.id ? setShowNotifications(true) : setShowLogin(true))}>
          <Bell size={18} />
          {unreadCount > 0 && <small>{unreadCount > 99 ? "99+" : unreadCount}</small>}
        </button>
      </section>

      {tab === "home" && (
        <section className="mobile-card sheet">
          <div className="map-wrap">
            <div className="map-frame">
              {selected ? (
                <MapContainer center={[selected.lat, selected.lng]} zoom={15} className="real-map">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {colonies.map((colony) => (
                    <Marker
                      key={colony.id}
                      position={[colony.lat, colony.lng]}
                      icon={markerIcon}
                      eventHandlers={{ click: () => setSelectedId(colony.id) }}
                    />
                  ))}
                </MapContainer>
              ) : (
                <div className="hint">Nessuna colonia caricata.</div>
              )}
            </div>
          </div>

          {selected && (
            <>
              <article className="mobile-card colony-summary" onClick={() => setShowColonyDetail(true)} role="button" tabIndex={0}>
                <img src={selected.photo || colonyPlaceholder} alt="" />
                <div>
                  <strong>{selected.name}</strong>
                  <div className="hint">{selected.zone}</div>
                  <span className="pill">{selected.aslDeclared ? "Dichiarata ASL" : "Da verificare"}</span>
                </div>
              </article>
              <div className="stats">
                <span><Cat size={16} /> {selected.cats} Gatti</span>
                <span><PawPrint size={16} /> {selected.kittens} Cucciolate</span>
              </div>
              <button className="ghost" type="button" onClick={() => setShowColonyDetail(true)}>
                Apri dettagli colonia
              </button>
            </>
          )}

          <div className="quick-actions">
            <button onClick={() => requireAuth(async () => { setAction("cat"); setTab("new"); })}>Aggiungi un gatto</button>
            <button onClick={() => requireAuth(async () => { setAction("birth"); setTab("report"); })}>Segnala cucciolata</button>
            <button onClick={() => requireAuth(async () => { setAction("rescue"); setTab("report"); })}>Segnalazione</button>
          </div>
          {status && <p className="hint">{status}</p>}
        </section>
      )}

      {tab === "new" && (
        <NewFlow
          action={action}
          selected={selected}
          colonies={colonies}
          sessionUser={sessionUser}
          onDone={async () => {
            await loadColonies();
            if (selected?.id) await loadCats(selected.id);
            setTab("home");
          }}
          onRequireAuth={() => setShowLogin(true)}
        />
      )}

      {tab === "report" && (
        <ReportFlow
          selected={selected}
          cats={cats}
          colonies={colonies}
          sessionUser={sessionUser}
          preset={action}
          onDone={() => setTab("home")}
          onRequireAuth={() => setShowLogin(true)}
        />
      )}

      {tab === "profile" && (
        <ProfileTab sessionUser={sessionUser} onOpenLogin={() => setShowLogin(true)} onLogout={logout} />
      )}

      {showLogin && (
        <LoginSheet
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(user) => {
            setSessionUser(user);
            setShowLogin(false);
          }}
        />
      )}

      {showMenu && (
        <section className="overlay" onClick={(event) => event.target === event.currentTarget && setShowMenu(false)}>
          <div className="mobile-card sheet menu-sheet">
            <div className="overlay-head">
              <h2>Menu</h2>
              <button className="icon-button" onClick={() => setShowMenu(false)}><X size={16} /></button>
            </div>
            <div className="menu-list">
              <button onClick={() => openFromMenu("home")}><MapPin size={16} />Mappa</button>
              <button onClick={() => openFromMenu("new")}><Plus size={16} />Nuovo</button>
              <button onClick={() => openFromMenu("report")}><Send size={16} />Segnala</button>
              <button onClick={() => openFromMenu("profile")}><UserRound size={16} />Profilo</button>
              <button onClick={() => { setAction("colony"); openFromMenu("new"); }}><Menu size={16} />Nuova colonia</button>
              {sessionUser?.id && <button className="danger" onClick={logout}><X size={16} />Esci</button>}
            </div>
          </div>
        </section>
      )}

      {showColonyDetail && selected && (
        <section className="overlay" onClick={(event) => event.target === event.currentTarget && setShowColonyDetail(false)}>
          <div className="mobile-card sheet">
            <div className="overlay-head">
              <h2>{selected.name}</h2>
              <button className="icon-button" onClick={() => setShowColonyDetail(false)}><X size={16} /></button>
            </div>
            <img className="photo-preview" src={selected.photo || colonyPlaceholder} alt="" />
            <p className="hint">{selected.zone}</p>
            <div className="stats">
              <span><Cat size={16} /> {selected.cats} Gatti</span>
              <span><PawPrint size={16} /> {selected.kittens} Cucciolate</span>
            </div>
            <div className="list">
              {cats.length === 0 ? (
                <p className="hint">Nessun gatto censito per questa colonia.</p>
              ) : (
                cats.map((cat) => (
                  <article key={cat.id} className="cat-row">
                    <img src={cat.photo || catPlaceholder} alt="" />
                    <div>
                      <strong>{cat.name}</strong>
                      <p className="hint">{[cat.sex, cat.notes].filter(Boolean).join(" · ")}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="quick-actions">
              <button onClick={() => requireAuth(async () => { setAction("cat"); setTab("new"); setShowColonyDetail(false); })}>Aggiungi un gatto</button>
            </div>
          </div>
        </section>
      )}

      {showNotifications && (
        <section className="overlay" onClick={(event) => event.target === event.currentTarget && setShowNotifications(false)}>
          <div className="mobile-card sheet notify-sheet">
            <div className="overlay-head">
              <h2>Notifiche</h2>
              <button className="icon-button" onClick={() => setShowNotifications(false)}><X size={16} /></button>
            </div>
            <div className="notify-actions">
              <button className="ghost" onClick={markAllNotificationsRead}>Segna tutte come lette</button>
            </div>
            <div className="list">
              {visibleNotifications.length === 0 && <p className="hint">Nessuna notifica non letta.</p>}
              {visibleNotifications.map((item) => (
                <article key={item.id} className={item.read ? "notify-row read" : "notify-row"}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  {!item.read && <button className="ghost" onClick={() => markNotificationRead(item.id)}>Segna come letta</button>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className="bottom-nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><MapPin size={16} />Mappa</button>
        <button className={tab === "new" ? "active" : ""} onClick={() => setTab("new")}><Plus size={16} />Nuovo</button>
        <button className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}><Send size={16} />Segnala</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><UserRound size={16} />Profilo</button>
      </nav>
    </main>
  );
}

function NewFlow({ action, selected, colonies, sessionUser, onDone, onRequireAuth }) {
  if (!sessionUser?.id) {
    return (
      <section className="mobile-card sheet">
        <h2>Accesso richiesto</h2>
        <p className="hint">Serve login per caricare nuovi gatti o colonie.</p>
        <button className="primary" onClick={onRequireAuth}>Accedi</button>
      </section>
    );
  }
  if (action === "colony") return <NewColonyFlow sessionUser={sessionUser} onDone={onDone} />;
  return <NewCatFlow sessionUser={sessionUser} selected={selected} colonies={colonies} onDone={onDone} />;
}

function NewCatFlow({ sessionUser, selected, colonies, onDone }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    photoFile: null,
    photoPreview: "",
    colonyId: selected?.id ?? colonies[0]?.id ?? "",
    name: "",
    sex: "",
    notes: "",
    sterilized: false,
  });
  const [saving, setSaving] = useState(false);

  const setField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const setPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDraft((d) => ({ ...d, photoFile: file, photoPreview: URL.createObjectURL(file) }));
  };

  async function submit() {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    setSaving(true);
    try {
      let photoUrl = "";
      if (draft.photoFile) {
        photoUrl = await uploadPublicImage(supabase, "cat-photos", draft.photoFile, `cats/${sessionUser.id}`);
      }
      const payload = {
        colony_id: draft.colonyId,
        name: draft.name || "Nuovo gatto",
        sex: draft.sex || null,
        notes: draft.notes || null,
        sterilized: draft.sterilized,
        photo_url: photoUrl || null,
        created_by: sessionUser.id,
      };
      const { error } = await supabase.from("cats").insert(payload);
      if (error) throw error;
      onDone();
    } catch (error) {
      setSaving(false);
      alert(error.message);
    }
  }

  return (
    <section className="mobile-card sheet">
      <h2>Nuovo gatto</h2>
      {step === 0 && (
        <>
          <label className="field photo-first">
            Foto (prima cosa)
            <img className="photo-preview" src={draft.photoPreview || catPlaceholder} alt="" />
            <input type="file" accept="image/*" capture="environment" onChange={setPhoto} />
          </label>
          <button className="primary" onClick={() => setStep(1)}>Continua</button>
        </>
      )}
      {step === 1 && (
        <>
          <label className="field">
            Colonia
            <select value={draft.colonyId} onChange={setField("colonyId")}>
              {colonies.map((colony) => (
                <option key={colony.id} value={colony.id}>{colony.name}</option>
              ))}
            </select>
          </label>
          <div className="row">
            <button className="ghost" onClick={() => setStep(0)}>Indietro</button>
            <button className="primary" onClick={() => setStep(2)}>Continua</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <label className="field">
            Nome
            <input value={draft.name} onChange={setField("name")} />
          </label>
          <label className="field">
            Sesso
            <select value={draft.sex} onChange={setField("sex")}>
              <option value="">Da verificare</option>
              <option value="Maschio">Maschio</option>
              <option value="Femmina">Femmina</option>
            </select>
          </label>
          <label className="field">
            Note
            <textarea value={draft.notes} onChange={setField("notes")} />
          </label>
          <label className="field">
            <input type="checkbox" checked={draft.sterilized} onChange={setField("sterilized")} />
            Sterilizzato
          </label>
          <div className="row">
            <button className="ghost" onClick={() => setStep(1)}>Indietro</button>
            <button className="primary" onClick={submit} disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</button>
          </div>
        </>
      )}
    </section>
  );
}

function NewColonyFlow({ sessionUser, onDone }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    photoFile: null,
    photoPreview: "",
    name: "",
    address: "",
    city: "Napoli",
    lat: "",
    lng: "",
    aslDeclared: false,
  });

  const setField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setDraft((d) => ({ ...d, [field]: value }));
  };
  const setPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDraft((d) => ({ ...d, photoFile: file, photoPreview: URL.createObjectURL(file) }));
  };

  const geolocate = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setDraft((d) => ({ ...d, lat: String(position.coords.latitude), lng: String(position.coords.longitude) }));
    });
  };

  async function submit() {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    setSaving(true);
    try {
      let photoUrl = "";
      if (draft.photoFile) {
        photoUrl = await uploadPublicImage(supabase, "colony-photos", draft.photoFile, `colonies/${sessionUser.id}`);
      }
      const payload = {
        name: draft.name,
        address: draft.address,
        city: draft.city,
        lat: Number(draft.lat),
        lng: Number(draft.lng),
        status: "Attiva",
        asl_declared: Boolean(draft.aslDeclared),
        photo_url: photoUrl || null,
        created_by: sessionUser.id,
        colony_admin_id: sessionUser.id,
      };
      const { error } = await supabase.from("colonies").insert(payload);
      if (error) throw error;
      onDone();
    } catch (error) {
      setSaving(false);
      alert(error.message);
    }
  }

  return (
    <section className="mobile-card sheet">
      <h2>Nuova colonia</h2>
      {step === 0 && (
        <>
          <label className="field photo-first">
            Foto (prima cosa)
            <img className="photo-preview" src={draft.photoPreview || colonyPlaceholder} alt="" />
            <input type="file" accept="image/*" capture="environment" onChange={setPhoto} />
          </label>
          <button className="primary" onClick={() => setStep(1)}>Continua</button>
        </>
      )}
      {step === 1 && (
        <>
          <label className="field">
            Posizione GPS
            <div className="row">
              <input value={draft.lat} onChange={setField("lat")} placeholder="Latitudine" />
              <input value={draft.lng} onChange={setField("lng")} placeholder="Longitudine" />
            </div>
          </label>
          <button className="ghost" onClick={geolocate}>Usa posizione attuale</button>
          <div className="row">
            <button className="ghost" onClick={() => setStep(0)}>Indietro</button>
            <button className="primary" onClick={() => setStep(2)}>Continua</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <label className="field"><span>Nome colonia</span><input value={draft.name} onChange={setField("name")} /></label>
          <label className="field"><span>Indirizzo</span><input value={draft.address} onChange={setField("address")} /></label>
          <label className="field"><span>Citta</span><input value={draft.city} onChange={setField("city")} /></label>
          <label className="field">
            <input type="checkbox" checked={draft.aslDeclared} onChange={setField("aslDeclared")} />
            Dichiarata all'ASL
          </label>
          <div className="row">
            <button className="ghost" onClick={() => setStep(1)}>Indietro</button>
            <button className="primary" onClick={submit} disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</button>
          </div>
        </>
      )}
    </section>
  );
}

function ReportFlow({ selected, cats, colonies, sessionUser, preset, onDone, onRequireAuth }) {
  const [draft, setDraft] = useState({
    colonyId: selected?.id ?? "",
    type: preset === "birth" ? "birth" : preset === "rescue" ? "rescue" : "problem",
    catId: "",
    title: "",
    description: "",
  });
  useEffect(() => {
    setDraft((d) => ({
      ...d,
      colonyId: selected?.id ?? d.colonyId,
      type: preset === "birth" ? "birth" : preset === "rescue" ? "rescue" : d.type,
    }));
  }, [selected?.id, preset]);

  if (!sessionUser?.id) {
    return (
      <section className="mobile-card sheet">
        <h2>Accesso richiesto</h2>
        <button className="primary" onClick={onRequireAuth}>Accedi</button>
      </section>
    );
  }

  const setField = (field) => (event) => setDraft((d) => ({ ...d, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    const title = draft.title || (draft.type === "birth" ? "Segnalazione cucciolata" : draft.type === "rescue" ? "Richiesta soccorso" : "Segnalazione");
    const description = draft.catId
      ? `${draft.description}\nGatto: ${cats.find((c) => c.id === draft.catId)?.name ?? draft.catId}`
      : draft.description;
    const payload = {
      colony_id: draft.colonyId,
      type: draft.type,
      status: "open",
      title,
      description,
      created_by: sessionUser.id,
    };
    const { error } = await supabase.from("reports").insert(payload);
    if (error) {
      alert(error.message);
      return;
    }
    onDone();
  }

  return (
    <form className="mobile-card sheet" onSubmit={submit}>
      <h2>Nuova segnalazione</h2>
      <label className="field">
        Colonia
        <select value={draft.colonyId} onChange={setField("colonyId")}>
          {colonies.map((colony) => (
            <option key={colony.id} value={colony.id}>{colony.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Tipo
        <select value={draft.type} onChange={setField("type")}>
          <option value="birth">Cucciolata</option>
          <option value="rescue">Soccorso</option>
          <option value="problem">Problema</option>
          <option value="sighting">Avvistamento</option>
        </select>
      </label>
      <label className="field">
        Gatto (solo per avvistamento)
        <select value={draft.catId} onChange={setField("catId")}>
          <option value="">Nessuno</option>
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Titolo
        <input value={draft.title} onChange={setField("title")} />
      </label>
      <label className="field">
        Dettagli
        <textarea value={draft.description} onChange={setField("description")} />
      </label>
      <button className="primary" type="submit">Salva segnalazione</button>
    </form>
  );
}

function ProfileTab({ sessionUser, onOpenLogin, onLogout }) {
  return (
    <section className="mobile-card sheet">
      <h2>Profilo</h2>
      {sessionUser ? (
        <>
          <p className="hint">{sessionUser.email}</p>
          <button className="ghost" onClick={onLogout}>Esci</button>
        </>
      ) : (
        <button className="primary" onClick={onOpenLogin}>Accedi</button>
      )}
      <p className="hint">La web app desktop resta disponibile per la gestione avanzata.</p>
    </section>
  );
}

function LoginSheet({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setStatus("");
    setBusy(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus("Supabase non configurato. Imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
        return;
      }
      const payload = { email, password };
      const result = mode === "register"
        ? await supabase.auth.signUp(payload)
        : await supabase.auth.signInWithPassword(payload);

      const { data, error } = result ?? {};
      if (error) {
        setStatus(error.message ?? "Errore autenticazione.");
        return;
      }

      if (mode === "register") {
        if (data?.session) {
          onLoginSuccess(data.session.user);
          return;
        }
        setStatus("Account creato. Controlla l'email per confermare e poi fai login.");
        return;
      }

      if (data?.session?.user) onLoginSuccess(data.session.user);
      else if (data?.user) onLoginSuccess(data.user);
      else setStatus("Login completato, ma la sessione non e' disponibile.");
    } catch (error) {
      setStatus(error?.message ?? "Errore autenticazione.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mobile-card sheet">
      <h2>{mode === "register" ? "Registrati" : "Accedi"}</h2>
      <form onSubmit={submit}>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Attendi..." : mode === "register" ? "Crea account" : "Entra"}
        </button>
      </form>
      <button className="ghost" onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}>
        {mode === "login" ? "Passa a registrazione" : "Passa a login"}
      </button>
      <button className="ghost" onClick={onClose}>Chiudi</button>
      {status && <p className="hint">{status}</p>}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
