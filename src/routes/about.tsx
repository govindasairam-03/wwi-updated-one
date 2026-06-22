import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { Linkedin, Instagram, Globe } from "lucide-react";
import venkatImg from "@/assets/team/Venkat Nalla - Founder and CEO of Work Wizards Innovations PVT LTD.jpg";
import santhoshImg from "@/assets/team/Santhosh Boppudi CTO.jpg";
import govindaImg from "@/assets/team/Govinda sai ram COO.jpg";
import charanImg from "@/assets/team/Charan Teja Rajanala MD.jpg";
import prudhviImg from "@/assets/team/Duvvu Prudhvi CFO.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Work Wizards Innovations" },
      { name: "description", content: "Meet the leadership and learn the story behind Work Wizards Innovations." },
      { property: "og:title", content: "About Us — Work Wizards Innovations" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const team = [
  {
    name: "Nalla Venkat",
    role: "Founder & Chief Executive Officer (CEO)",
    bio: "Nalla Venkat is the founder of Work Wizards Innovations and the visionary behind the company's mission and long-term strategy. He leads the organization by defining its direction, identifying new opportunities, and driving innovation across all projects. Venkat focuses on building strong partnerships, guiding the development of new technologies, and ensuring that the company continuously evolves to meet future industry demands.",
    image: venkatImg,
    links: {
      linkedin: "https://www.linkedin.com/in/nallavenkat/",
      instagram: "https://www.instagram.com/venkatnalla_7/",
      web: "https://venkatnalla.in",
    },
  },

  {
    name: "Santhosh Boppudi",
    role: "Co-Founder & Chief Technology Officer (CTO)",
    bio: "Santhosh Boppudi leads the technological development at Work Wizards Innovations. As CTO, he is responsible for designing the company's technical architecture, overseeing software development, and ensuring that the products are built using efficient and scalable technologies. He plays a key role in transforming ideas into functional digital platforms and maintaining the technological backbone of the organization.",
    image: santhoshImg,
    links: {
      linkedin: "https://www.linkedin.com/in/santhoshboppudi/",
      instagram: "https://www.instagram.com/boppudi.wwi/",
      web: "https://santhoshboppudi.in",
    },
  },

  {
    name: "Govinda Sai Ram Thammisetty",
    role: "Chief Operating Officer (COO)",
    bio: "Govinda Sai Ram Thammisetty manages the operational structure of the company. As COO, he ensures that projects are executed efficiently and that team coordination remains smooth across all activities. He focuses on operational planning, resource management, and maintaining the workflow required to deliver successful products and services.",
    image: govindaImg,
    links: {
      linkedin: "https://www.linkedin.com/in/govinda-sai-ram/",
      instagram: "https://www.instagram.com/ram.wwi/",
    },
  },

  {
    name: "Charan Teja Rajanala",
    role: "Chief Marketing Officer (CMO)",
    bio: "Charan Teja Rajanala is responsible for the marketing strategy and brand development of Work Wizards Innovations. As CMO, he focuses on promoting the company's products, expanding market reach, and building a strong brand presence. His work involves digital marketing strategies, partnership outreach, and ensuring that the company's innovations reach the right audience.",
    image: charanImg,
    links: {
      linkedin: "https://www.linkedin.com/in/rajanalacharanteja/",
      instagram: "https://www.instagram.com/charan.wwi/",
    },
  },

  {
    name: "Prudhvi Duvvu",
    role: "Chief Financial Officer (CFO)",
    bio: "Prudhvi Duvvu oversees the financial planning and management of Work Wizards Innovations. As CFO, he is responsible for managing financial resources, budgeting, and ensuring sustainable financial growth. He plays an important role in maintaining financial stability while supporting the company's expansion and long-term business strategy.",
    image: prudhviImg,
    links: {
      linkedin: "https://www.linkedin.com/in/prudhviduvvu/",
      instagram: "https://www.instagram.com/prudhvi.wwi/",
    },
  },
] as const;

const partners = [
  {
    name: "Vaivaanith",
    role: "Promotional Partner",
    url: "https://vaivaanith.in",
    text: "VAIVAANITH",
    bg: "#f5efe6",
    textStyle: {
      fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      color: "#3b2a1a",
      letterSpacing: "0.28em",
      fontWeight: 600 as const,
    },
  },
  {
    name: "Mentneo",
    role: "Hiring Partner",
    url: "https://mentneo.com",
    text: "MENTNEO",
    bg: "#0a0a0a",
    textStyle: {
      fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      color: "#ffffff",
      letterSpacing: "0.06em",
      fontWeight: 800 as const,
    },
  },
];

function avatarFor(name: string, colors: [string, string]) {
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const [start, end] = colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="40" fill="url(#g)" />
      <circle cx="152" cy="140" r="94" fill="rgba(255,255,255,0.14)" filter="url(#blur)" />
      <circle cx="380" cy="124" r="72" fill="rgba(255,255,255,0.12)" filter="url(#blur)" />
      <circle cx="408" cy="392" r="120" fill="rgba(255,255,255,0.08)" filter="url(#blur)" />
      <path d="M118 396c24-72 79-110 138-110s114 38 138 110" fill="rgba(255,255,255,0.18)" />
      <circle cx="256" cy="208" r="88" fill="rgba(255,255,255,0.22)" />
      <path d="M186 346c16-32 50-54 70-54s54 22 70 54" fill="rgba(255,255,255,0.18)" />
      <text x="50%" y="283" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="108" font-weight="800" fill="#ffffff">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function PersonAvatar({ image, name }: { image: string; name: string }) {
  return <img loading="lazy" src={image} alt={`${name} portrait`} className="w-full h-full object-cover" />;
}

function AboutPage() {
  return (
    <>
      <PageHero title="Our Story & Team" description="The passionate leaders behind Work Wizards Innovations, committed to driving digital transformation and delivering excellence." />

      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold">Meet the Leadership</h2></Reveal>
          <div className="space-y-16">
            {team.map((m, i) => (
              <Reveal key={m.name}>
                <div className={`grid md:grid-cols-[260px_1fr] gap-8 items-start ${i % 2 ? "md:[direction:rtl]" : ""}`}>
                  <div className="md:[direction:ltr] w-full aspect-square rounded-2xl overflow-hidden bg-card border border-border">
                    <PersonAvatar image={m.image} name={m.name} />
                  </div>
                  <div className="md:[direction:ltr]">
                    <h3 className="text-2xl font-bold">{m.name}</h3>
                    <div className="text-sm font-medium text-muted-foreground mt-1">{m.role}</div>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
                    <div className="mt-5 flex gap-2">
                      {"linkedin" in m.links && m.links.linkedin && <a aria-label="LinkedIn" href={m.links.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-secondary hover:bg-foreground hover:text-background transition"><Linkedin className="w-4 h-4" /></a>}
                      {"instagram" in m.links && m.links.instagram && <a aria-label="Instagram" href={m.links.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-secondary hover:bg-foreground hover:text-background transition"><Instagram className="w-4 h-4" /></a>}
                      {"web" in m.links && m.links.web && <a aria-label="Website" href={m.links.web} target="_blank" rel="noopener noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-secondary hover:bg-foreground hover:text-background transition"><Globe className="w-4 h-4" /></a>}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-surface">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-3"><h2 className="text-3xl md:text-4xl font-bold">Our Partners</h2></Reveal>
          <Reveal className="text-center mb-10"><p className="text-sm md:text-base text-muted-foreground">Collaborating with brands that share our vision for innovation and growth.</p></Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {partners.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.05}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-border overflow-hidden bg-background hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-40 md:h-48 grid place-items-center px-6 transition-transform group-hover:scale-[1.02]"
                    style={{ background: p.bg }}
                  >
                    <span
                      className="text-2xl md:text-4xl"
                      style={p.textStyle}
                    >
                      {p.text}
                    </span>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-lg font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{p.role}</div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
