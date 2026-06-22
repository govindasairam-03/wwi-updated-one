import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "../components/PageHero";
import { ContactForm } from "../components/ContactForm";
import { Reveal } from "../components/Reveal";
import { Mail, Phone, Linkedin, Instagram, Twitter, Facebook } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Work Wizards Innovations" },
      { name: "description", content: "Get in touch with Work Wizards Innovations. Let's discuss your next project." },
      { property: "og:title", content: "Contact — Work Wizards Innovations" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/workwizardsinnovations" },
  { icon: Twitter, label: "X (Twitter)", href: "https://x.com/workwizards26" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/workwizardsinnovations" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/workwizardsinnovations" },
  { icon: Phone, label: "+91 96181 31779", href: "tel:+919618131779" },
  { icon: Phone, label: "+91 94920 33686", href: "tel:+919492033686" },
  { icon: Mail, label: "official@wwi.org.in", href: "mailto:official@wwi.org.in" },
];

function ContactPage() {
  return (
    <>
      <PageHero title="Get In Touch" description="Have a project in mind? Let's discuss how we can help bring your ideas to life." />
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto grid gap-6 md:gap-8 md:grid-cols-2 items-start">
          <Reveal><ContactForm /></Reveal>
          <Reveal delay={0.1}>
            <div className="p-6 md:p-7 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold text-lg">Connect With Us</h3>
              <p className="mt-2 text-sm text-muted-foreground">Follow us on social media to stay updated with our latest innovations and products.</p>
              <ul className="mt-6 space-y-4 text-sm">
                {socials.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                      className="group flex items-center gap-3 hover:text-foreground transition">
                      <span className="w-9 h-9 grid place-items-center rounded-lg bg-foreground text-background group-hover:opacity-90 transition">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="font-medium">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
