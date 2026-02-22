"use client";
import { useState, useEffect, useRef } from "react";

const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_HERE";

// --- Video URL Utilities ---
const getVideoType = (url) => {
  if (!url) return "unknown";
  if (url.match(/youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts|youtube\.com\/embed/)) return "youtube";
  if (url.match(/tiktok\.com/)) return "tiktok";
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return "mp4";
  return "unknown";
};

const getYouTubeId = (url) => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const getTikTokId = (url) => {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
};

const getYouTubeThumbnail = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

// --- Components ---

const SAMPLE_GALLERY = [
  { type: "video", url: "/images/grinding.mp4", caption: "Large oak stump removal", poster: "/images/stump-thumbnail.png" },
  { type: "image", url: "/images/machine.jpg", caption: "Bandit Machine" },
  { type: "image", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop", caption: "Clean finish after grinding" },
  { type: "image", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop", caption: "Commercial lot preparation" },
  { type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "Stump grinding in action", videoId: "dQw4w9WgXcQ" },
  { type: "image", url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=400&fit=crop", caption: "Before & after comparison" },
];

const SAMPLE_REVIEWS = [
  { name: "Mike R.", rating: 5, text: "Incredible work! They removed 3 massive stumps from my backyard in just a few hours. Yard looks brand new.", date: "2025-12-15" },
  { name: "Sarah T.", rating: 5, text: "Very professional crew. Fair pricing and they cleaned up everything perfectly. Highly recommend!", date: "2025-11-28" },
  { name: "James P.", rating: 4, text: "Great service, showed up on time and got the job done fast. Will use again for sure.", date: "2025-10-10" },
];

const StarRating = ({ rating, onRate, interactive = false, size = 20 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width={size} height={size} viewBox="0 0 24 24"
        fill={star <= rating ? "#D4A017" : "none"} stroke={star <= rating ? "#D4A017" : "#8B7355"}
        strokeWidth="2" style={{ cursor: interactive ? "pointer" : "default" }}
        onClick={() => interactive && onRate?.(star)}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

// --- Video Player Component ---
const VideoPlayer = ({ item, onClose }) => {
  if (item.type === "youtube") {
    return (
      <iframe
        width="900" height="506"
        src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0`}
        title={item.caption}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12 }}
      />
    );
  }
  if (item.type === "tiktok") {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${item.videoId}`}
        width="340" height="600"
        frameBorder="0"
        allow="autoplay"
        allowFullScreen
        style={{ borderRadius: 12, maxHeight: "80vh" }}
      />
    );
  }
  // mp4 fallback
  return (
    <video controls autoPlay style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12 }}>
      <source src={item.url} type="video/mp4" />
    </video>
  );
};

// --- Gallery Thumbnail ---
const GalleryThumbnail = ({ item }) => {
  const isVideo = item.type === "youtube" || item.type === "tiktok" || item.type === "video";

  let thumbUrl = item.url;
  if (item.type === "youtube" && item.videoId) {
    thumbUrl = getYouTubeThumbnail(item.videoId);
  } else if (item.type === "tiktok") {
    thumbUrl = item.poster || "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop";
  } else if (item.type === "video" && item.poster) {
    thumbUrl = item.poster;
  }

  const platformBadge = item.type === "youtube" ? (
    <div style={{
      position: "absolute", top: 10, left: 10, padding: "4px 10px",
      background: "rgba(255,0,0,0.9)", borderRadius: 6,
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.5px"
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.8 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.8-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z"/>
        <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#FF0000" stroke="white" strokeWidth="0"/>
        <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="red"/>
      </svg>
      YouTube
    </div>
  ) : item.type === "tiktok" ? (
    <div style={{
      position: "absolute", top: 10, left: 10, padding: "4px 10px",
      background: "rgba(0,0,0,0.85)", borderRadius: 6,
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.5px"
    }}>
      <svg width="12" height="14" viewBox="0 0 24 28" fill="none">
        <path d="M17.5 0.5C17.5 0.5 17.5 5.5 22.5 6.5V11C22.5 11 19 11 17.5 9V19.5C17.5 24.5 12 27.5 7.5 25C3 22.5 2.5 17 5 13.5C7.5 10 12.5 10 14 11.5V16.5C14 16.5 11.5 15 10 16.5C8.5 18 9 20.5 11 21.5C13 22.5 15 21 15 19V0.5H17.5Z" fill="white"/>
      </svg>
      TikTok
    </div>
  ) : null;

  return (
    <>
      <img src={thumbUrl} alt={item.caption}
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {isVideo && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.3)"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: item.type === "youtube" ? "rgba(255,0,0,0.9)" : item.type === "tiktok" ? "rgba(0,0,0,0.85)" : "rgba(212,160,23,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "transform 0.2s"
          }}>
            <span style={{ fontSize: 22, marginLeft: 3, color: "#fff" }}>▶</span>
          </div>
        </div>
      )}
      {platformBadge}
    </>
  );
};

// --- Admin Panel ---
const AdminPanel = ({ onAddMedia, onClose }) => {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");

  const detected = (() => {
    const vt = getVideoType(url);
    if (vt === "youtube") {
      const id = getYouTubeId(url);
      return { type: "youtube", id, thumb: id ? getYouTubeThumbnail(id) : null };
    } else if (vt === "tiktok") {
      const id = getTikTokId(url);
      return { type: "tiktok", id };
    } else if (vt === "mp4") {
      return { type: "mp4" };
    } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) || url.includes("unsplash.com")) {
      return { type: "image" };
    }
    return null;
  })();

  const handleSubmit = () => {
    if (!url.trim()) return;
    setUploading(true);
    setTimeout(() => {
      let item;
      if (detected?.type === "youtube") {
        item = { type: "youtube", url: url.trim(), caption: caption.trim(), videoId: detected.id };
      } else if (detected?.type === "tiktok") {
        item = { type: "tiktok", url: url.trim(), caption: caption.trim(), videoId: detected.id, poster: posterUrl.trim() || undefined };
      } else if (detected?.type === "mp4") {
        item = { type: "video", url: url.trim(), caption: caption.trim(), poster: posterUrl.trim() || undefined };
      } else {
        item = { type: "image", url: url.trim(), caption: caption.trim() };
      }
      onAddMedia(item);
      setUrl(""); setCaption(""); setPosterUrl(""); setUploading(false);
    }, 600);
  };

  const typeLabel = detected?.type === "youtube" ? "YouTube Video" : detected?.type === "tiktok" ? "TikTok Video" : detected?.type === "mp4" ? "Video File" : detected?.type === "image" ? "Image" : "Paste any URL";
  const typeColor = detected?.type === "youtube" ? "#FF0000" : detected?.type === "tiktok" ? "#69C9D0" : detected?.type === "mp4" ? "#D4A017" : detected?.type === "image" ? "#4CAF50" : "#8B7355";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,12,8,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        background: "linear-gradient(165deg, #2A2318 0%, #1A1510 100%)",
        border: "1px solid rgba(212,160,23,0.3)", borderRadius: 16,
        padding: "40px", maxWidth: 520, width: "90%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#D4A017", margin: 0 }}>
            Add to Gallery
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#8B7355", fontSize: 28, cursor: "pointer", lineHeight: 1
          }}>×</button>
        </div>

        {/* Supported platforms */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap"
        }}>
          {[
            { icon: "🖼️", label: "Images", color: "#4CAF50" },
            { icon: "🎥", label: "MP4", color: "#D4A017" },
            { icon: "▶", label: "YouTube", color: "#FF0000" },
            { icon: "♪", label: "TikTok", color: "#69C9D0" },
          ].map((p) => (
            <div key={p.label} style={{
              padding: "6px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: p.color, fontWeight: 600
            }}>
              <span>{p.icon}</span> {p.label}
            </div>
          ))}
        </div>

        {/* URL Input */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any URL — YouTube, TikTok, image, or video..."
            style={{
              width: "100%", padding: "14px 16px", paddingRight: detected ? "130px" : "16px",
              borderRadius: 8, border: "1px solid rgba(139,115,85,0.3)",
              background: "rgba(255,255,255,0.05)", color: "#E8DCC8",
              fontFamily: "'DM Sans', sans-serif", fontSize: 15,
              boxSizing: "border-box", outline: "none"
            }}
          />
          {detected && (
            <div style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              padding: "4px 12px", borderRadius: 6,
              background: `${typeColor}22`, border: `1px solid ${typeColor}44`,
              fontSize: 12, fontWeight: 700, color: typeColor,
              display: "flex", alignItems: "center", gap: 5
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor }} />
              {typeLabel}
            </div>
          )}
        </div>

        {/* YouTube preview */}
        {detected?.type === "youtube" && detected.thumb && (
          <div style={{
            marginBottom: 14, borderRadius: 8, overflow: "hidden",
            border: "1px solid rgba(255,0,0,0.2)", position: "relative"
          }}>
            <img src={detected.thumb} alt="YouTube thumbnail"
              style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.3)"
            }}>
              <div style={{
                background: "rgba(255,0,0,0.9)", borderRadius: "50%",
                width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "#fff", fontSize: 16, marginLeft: 2 }}>▶</span>
              </div>
            </div>
            <div style={{
              position: "absolute", bottom: 8, left: 8, padding: "3px 8px",
              background: "rgba(0,0,0,0.7)", borderRadius: 4,
              fontSize: 11, color: "#fff", fontWeight: 600
            }}>YouTube Preview</div>
          </div>
        )}

        {/* Poster URL for TikTok / MP4 */}
        {(detected?.type === "tiktok" || detected?.type === "mp4") && (
          <input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="Thumbnail image URL (optional)..."
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 8,
              border: "1px solid rgba(139,115,85,0.3)", background: "rgba(255,255,255,0.05)",
              color: "#E8DCC8", fontFamily: "'DM Sans', sans-serif", fontSize: 15,
              marginBottom: 14, boxSizing: "border-box", outline: "none"
            }}
          />
        )}

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)..."
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 8,
            border: "1px solid rgba(139,115,85,0.3)", background: "rgba(255,255,255,0.05)",
            color: "#E8DCC8", fontFamily: "'DM Sans', sans-serif", fontSize: 15,
            marginBottom: 20, boxSizing: "border-box", outline: "none"
          }}
        />

        {/* Help text */}
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 16px",
          marginBottom: 20, border: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#D4A017", marginBottom: 8 }}>SUPPORTED LINKS</div>
          <div style={{ fontSize: 12, color: "#6B5B45", lineHeight: 1.8 }}>
            <div>📺 <span style={{ color: "#8B7355" }}>youtube.com/watch?v=...</span> or <span style={{ color: "#8B7355" }}>youtu.be/...</span> or <span style={{ color: "#8B7355" }}>youtube.com/shorts/...</span></div>
            <div>🎵 <span style={{ color: "#8B7355" }}>tiktok.com/@user/video/123...</span></div>
            <div>🎥 <span style={{ color: "#8B7355" }}>Any direct .mp4 link</span></div>
            <div>🖼️ <span style={{ color: "#8B7355" }}>Any image URL (.jpg, .png, .webp)</span></div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!url.trim() || uploading} style={{
          width: "100%", padding: "14px", borderRadius: 8, border: "none",
          background: url.trim() ? "linear-gradient(135deg, #D4A017, #B8860B)" : "rgba(139,115,85,0.3)",
          color: url.trim() ? "#1A1510" : "#5a4d3a", fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, fontWeight: 700, cursor: url.trim() ? "pointer" : "default",
          transition: "all 0.3s"
        }}>
          {uploading ? "Adding..." : detected ? `Add ${typeLabel}` : "Add to Gallery"}
        </button>
      </div>
    </div>
  );
};

// --- Lightbox ---
const Lightbox = ({ item, onClose }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex: 999,
    background: "rgba(10,8,5,0.92)", backdropFilter: "blur(12px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", animation: "fadeIn 0.3s ease"
  }}>
    <div onClick={(e) => e.stopPropagation()} style={{
      maxWidth: "90vw", maxHeight: "85vh", position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      {item.type === "image" ? (
        <img src={item.url} alt={item.caption} style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12, objectFit: "contain" }} />
      ) : (
        <VideoPlayer item={item} />
      )}
      {item.caption && (
        <p style={{
          textAlign: "center", color: "#C4B69C", fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, marginTop: 12
        }}>{item.caption}</p>
      )}
      <button onClick={onClose} style={{
        position: "absolute", top: -16, right: -16, width: 36, height: 36, borderRadius: "50%",
        background: "#D4A017", border: "none", color: "#1A1510", fontSize: 20, cursor: "pointer",
        fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center"
      }}>×</button>
    </div>
  </div>
);

// --- Main Website ---
export default function StumpBustersWebsite() {
  const [gallery, setGallery] = useState(SAMPLE_GALLERY);
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [estimate, setEstimate] = useState({ firstName: "", lastName: "", address: "", email: "", phone: "" });
  const [estimateSubmitted, setEstimateSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try { const g = await localStorage.getItem("gallery-data"); if (g) setGallery(JSON.parse(g.value)); } catch {}
      try { const r = await localStorage.getItem("reviews-data"); if (r) setReviews(JSON.parse(r.value)); } catch {}
    })();
  }, []);

  const saveGallery = async (g) => { setGallery(g); try { await localStorage.setItem("gallery-data", JSON.stringify(g)); } catch {} };
  const saveReviews = async (r) => { setReviews(r); try { await localStorage.setItem("reviews-data", JSON.stringify(r)); } catch {} };

  const handleAddMedia = (item) => { saveGallery([item, ...gallery]); setShowAdmin(false); };

  const handleReviewSubmit = () => {
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) return;
    saveReviews([{ name: reviewName.trim(), rating: reviewRating, text: reviewText.trim(), date: new Date().toISOString().split("T")[0] }, ...reviews]);
    setReviewSubmitted(true);
    setTimeout(() => { setReviewName(""); setReviewText(""); setReviewRating(0); setReviewSubmitted(false); }, 3000);
  };

  const handleEstimateSubmit = () => {
    const { firstName, lastName, address, email, phone } = estimate;
    if (!firstName || !lastName || !address || !email || !phone) return;
    setEstimateSubmitted(true);
    setTimeout(() => { setEstimate({ firstName: "", lastName: "", address: "", email: "", phone: "" }); setEstimateSubmitted(false); }, 4000);
  };

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setActiveSection(id); };
  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0";

  const inputStyle = {
    width: "100%", padding: "14px 18px", borderRadius: 10,
    border: "1px solid rgba(139,115,85,0.35)", background: "rgba(255,255,255,0.04)",
    color: "#E8DCC8", fontFamily: "'DM Sans', sans-serif", fontSize: 15,
    boxSizing: "border-box", outline: "none", transition: "border-color 0.3s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0C08", color: "#E8DCC8", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        input:focus, textarea:focus { border-color: #D4A017 !important; }
        ::selection { background: rgba(212,160,23,0.3); }
        * { scrollbar-width: thin; scrollbar-color: #3a3020 #1A1510; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(15,12,8,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(212,160,23,0.12)",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 68
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #D4A017, #8B6914)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}></div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#D4A017", letterSpacing: "-0.5px" }}> NoMoreStumps</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[["home", "Home"], ["gallery", "Gallery"], ["reviews", "Reviews"], ["estimate", "Free Estimate"]].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: "none", border: "none", color: activeSection === id ? "#D4A017" : "#8B7355",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: "pointer", transition: "color 0.3s", letterSpacing: "0.5px", textTransform: "uppercase"
            }}>{label}</button>
          ))}
          <button onClick={() => setIsAdmin(!isAdmin)} style={{
            background: isAdmin ? "rgba(212,160,23,0.15)" : "transparent",
            border: "1px solid", borderColor: isAdmin ? "#D4A017" : "rgba(139,115,85,0.3)",
            color: isAdmin ? "#D4A017" : "#6B5B45", borderRadius: 8,
            padding: "6px 14px", fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600
          }}>{isAdmin ? "Admin ✓" : "Owner Login"}</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", paddingTop: 68
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1600&h=900&fit=crop')",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.2) saturate(0.6)"
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 30% 50%, rgba(212,160,23,0.08) 0%, transparent 60%), linear-gradient(180deg, transparent 60%, #0F0C08 100%)"
        }} />
        <div style={{
          position: "relative", zIndex: 2, textAlign: "center",
          maxWidth: 800, padding: "0 24px", animation: "slideUp 1s ease"
        }}>
          <div style={{
            display: "inline-block", padding: "8px 24px", borderRadius: 40,
            border: "1px solid rgba(212,160,23,0.3)", background: "rgba(212,160,23,0.08)",
            marginBottom: 28, fontSize: 13, letterSpacing: "2px", textTransform: "uppercase",
            color: "#D4A017", fontWeight: 600
          }}>Professional Stump Removal Services</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: 900, lineHeight: 1.05, margin: "0 0 24px",
            background: "linear-gradient(135deg, #E8DCC8 0%, #D4A017 50%, #C4B69C 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>We Remove Stumps.<br />You Reclaim Your Yard.</h1>
          <p style={{ fontSize: 19, color: "#8B7355", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px", fontWeight: 400 }}>
            Fast, affordable, and thorough stump grinding and removal for residential and commercial properties. Licensed & insured with 15+ years of experience.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("estimate")} style={{
              padding: "16px 36px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #D4A017, #B8860B)",
              color: "#0F0C08", fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(212,160,23,0.3)"
            }}>Get Free Estimate</button>
            <button onClick={() => scrollTo("gallery")} style={{
              padding: "16px 36px", borderRadius: 12,
              border: "1px solid rgba(212,160,23,0.35)", background: "rgba(212,160,23,0.08)",
              color: "#D4A017", fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, fontWeight: 600, cursor: "pointer"
            }}>View Our Work</button>
          </div>
          <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
            {[["800+", "Stumps Removed"], ["15+", "Years Experience"], [avgRating + " ★", "Avg Rating"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#D4A017" }}>{num}</div>
                <div style={{ fontSize: 13, color: "#6B5B45", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 13, color: "#D4A017", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600, marginBottom: 12 }}>Our Portfolio</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700, margin: "0 0 16px", color: "#E8DCC8"
          }}>Photos & Videos</h2>
          <p style={{ color: "#6B5B45", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            See our work in action — from massive oak stumps to full lot clearing. Follow us on YouTube & TikTok!
          </p>
          {isAdmin && (
            <button onClick={() => setShowAdmin(true)} style={{
              marginTop: 24, padding: "12px 28px", borderRadius: 10, border: "1px solid #D4A017",
              background: "rgba(212,160,23,0.1)", color: "#D4A017",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}>+ Add Photo / YouTube / TikTok</button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {gallery.map((item, i) => (
            <div key={i} onClick={() => setLightboxItem(item)} style={{
              position: "relative", borderRadius: 14, overflow: "hidden",
              cursor: "pointer", aspectRatio: "4/3",
              border: "1px solid rgba(139,115,85,0.15)",
              transition: "transform 0.3s, box-shadow 0.3s",
              animation: `slideUp 0.6s ease ${i * 0.08}s both`
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <GalleryThumbnail item={item} />
              {item.caption && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "24px 16px 14px",
                  background: "linear-gradient(transparent, rgba(15,12,8,0.85))",
                  fontSize: 14, fontWeight: 500, color: "#C4B69C"
                }}>{item.caption}</div>
              )}
              {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); saveGallery(gallery.filter((_, idx) => idx !== i)); }} style={{
                  position: "absolute", top: 10, right: 10, width: 30, height: 30,
                  borderRadius: "50%", background: "rgba(180,40,40,0.8)", border: "none",
                  color: "#fff", fontSize: 16, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", zIndex: 5
                }}>×</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{
        padding: "100px 32px",
        background: "linear-gradient(180deg, rgba(42,35,24,0.3) 0%, rgba(15,12,8,0) 100%)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, color: "#D4A017", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600, marginBottom: 12 }}>Testimonials</p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700, margin: "0 0 16px", color: "#E8DCC8"
            }}>What Our Customers Say</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
              <StarRating rating={Math.round(parseFloat(avgRating))} size={22} />
              <span style={{ color: "#8B7355", fontSize: 15 }}>{avgRating} average from {reviews.length} reviews</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, marginBottom: 64 }}>
            {reviews.slice(0, 6).map((r, i) => (
              <div key={i} style={{
                background: "linear-gradient(165deg, rgba(42,35,24,0.6), rgba(26,21,16,0.8))",
                border: "1px solid rgba(139,115,85,0.2)", borderRadius: 16,
                padding: "28px", animation: `slideUp 0.6s ease ${i * 0.1}s both`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#E8DCC8", marginBottom: 4 }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: "#6B5B45" }}>{new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <StarRating rating={r.rating} size={16} />
                </div>
                <p style={{ color: "#A89878", lineHeight: 1.7, margin: 0, fontSize: 15 }}>"{r.text}"</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 900, margin: "0 auto" }}>
            <div style={{
              background: "linear-gradient(165deg, rgba(42,35,24,0.5), rgba(26,21,16,0.7))",
              border: "1px solid rgba(139,115,85,0.2)", borderRadius: 16, padding: "32px"
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#D4A017", margin: "0 0 20px" }}>Leave a Review</h3>
              {reviewSubmitted ? (
                <div style={{ textAlign: "center", padding: "40px 20px", animation: "slideUp 0.4s ease" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                  <p style={{ color: "#D4A017", fontSize: 18, fontWeight: 600 }}>Thank you for your review!</p>
                </div>
              ) : (<>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: "#6B5B45", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>Your Rating</label>
                  <StarRating rating={reviewRating} onRate={setReviewRating} interactive size={28} />
                </div>
                <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your name" style={{ ...inputStyle, marginBottom: 14 }} />
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell us about your experience..." rows={4} style={{ ...inputStyle, resize: "vertical", marginBottom: 18 }} />
                <button onClick={handleReviewSubmit} disabled={!reviewName.trim() || !reviewText.trim() || reviewRating === 0} style={{
                  width: "100%", padding: "14px", borderRadius: 10, border: "none",
                  background: reviewRating > 0 ? "linear-gradient(135deg, #D4A017, #B8860B)" : "rgba(139,115,85,0.3)",
                  color: reviewRating > 0 ? "#0F0C08" : "#5a4d3a",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                  cursor: reviewRating > 0 ? "pointer" : "default"
                }}>Submit Review</button>
              </>)}
            </div>

            <div style={{
              background: "linear-gradient(165deg, rgba(42,35,24,0.5), rgba(26,21,16,0.7))",
              border: "1px solid rgba(139,115,85,0.2)", borderRadius: 16, padding: "32px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16,
                background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 24
              }}>G</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#E8DCC8", margin: "0 0 12px" }}>Review Us on Google</h3>
              <p style={{ color: "#6B5B45", lineHeight: 1.7, fontSize: 14, marginBottom: 28, maxWidth: 280 }}>
                Your Google review helps other homeowners find reliable stump removal services.
              </p>
              <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block", padding: "14px 32px", borderRadius: 10,
                background: "#4285F4", color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                textDecoration: "none", boxShadow: "0 4px 20px rgba(66,133,244,0.3)"
              }}>★ Leave a Google Review</a>
              <p style={{ color: "#5a4d3a", fontSize: 12, marginTop: 16 }}>Opens Google Maps in a new tab</p>
            </div>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(139,115,85,0.15)", padding: "48px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#D4A017", marginBottom: 16 }}> NoMoreStumps</div>
        <p style={{ color: "#5a4d3a", fontSize: 24, lineHeight: 1.8, maxWidth: 800, margin: "0 auto 24px" }}>
          Licensed, insured, and committed to quality.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 24 }}>
          <a href="tel:+15551234567" style={{ color: "#8B7355", fontSize: 24, textDecoration: "none" }}>📞 (786) 283-3491</a>
          <a href="mailto:info@nomorestumps.co" style={{ color: "#8B7355", fontSize: 24, textDecoration: "none" }}>✉️ info@NoMoreStumps.co</a>
        </div>
        <p style={{ color: "#3a3020", fontSize: 12 }}>© 2026 NoMoreStumps. All rights reserved.</p>
      </footer>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
      {showAdmin && <AdminPanel onAddMedia={handleAddMedia} onClose={() => setShowAdmin(false)} />}
    </div>
  );
}