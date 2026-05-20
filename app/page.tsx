import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";
import { Heart, Brain, Bone, Baby, Stethoscope, Activity, Calendar, User, Pill, CheckCircle2 } from "lucide-react";

const services = [
  { icon: <Heart size={28} className={styles.iconSVG} />, name: "Cardiology", desc: "Heart & vascular care" },
  { icon: <Brain size={28} className={styles.iconSVG} />, name: "Neurology", desc: "Brain & nervous system" },
  { icon: <Bone size={28} className={styles.iconSVG} />, name: "Orthopedics", desc: "Bones & joints" },
  { icon: <Baby size={28} className={styles.iconSVG} />, name: "Pediatrics", desc: "Child healthcare" },
  { icon: <Stethoscope size={28} className={styles.iconSVG} />, name: "Primary Care", desc: "Everyday health & checkups" },
  { icon: <Activity size={28} className={styles.iconSVG} />, name: "Dermatology", desc: "Skin, hair & nail care" },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContainer}>
            <div className={styles.heroText}>

              <h1 className={styles.heroTitle}>
                World-class doctors.<br />
                <span className={styles.heroAccent}>At your fingertips.</span>
              </h1>
              <p className={styles.heroSub}>
                Nisir Hikimina connects you with top-tier medical professionals. Book an in-person visit or a virtual consultation from the comfort of your home.
              </p>
              <div className={styles.heroActions}>
                <Link href="/book">
                  <button className={styles.btnPrimary}>Book an Appointment</button>
                </Link>
                <div className={styles.heroTrust}>
                  <div className={styles.stars}>★★★★★</div>
                  <span>4.9/5 from 2,400+ patients</span>
                </div>
              </div>
            </div>
            <div className={styles.heroImageWrapper}>
              <div className={styles.imageBackground}></div>
              <Image
                src="/doctor_hero.png"
                alt="Professional doctor"
                width={500}
                height={600}
                className={styles.heroImage}
                priority
              />
              {/* Floating review card */}
              <div className={styles.floatingCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.stars}>★★★★★</span>
                </div>
                <p className={styles.cardText}>"The best medical experience I've ever had. Highly recommend Nisir Hikimina!"</p>
                <p className={styles.cardAuthor}>- Sarah M.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER */}
        <section className={styles.trustBanner}>
          <div className={styles.trustLogos}>
            <span>Trusted By:</span>
            <div className={styles.logos}>
              <span className={styles.fakeLogo}>Healthline</span>
              <span className={styles.fakeLogo}>Medical News Today</span>
              <span className={styles.fakeLogo}>WebMD</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.howItWorks}>
          <div className={styles.container}>
            <div className={styles.hiwHeader}>
              <h2 className={styles.sectionTitle}>How Nisir Hikimina works</h2>
              <p className={styles.sectionSub}>Get the care you need in 3 simple steps</p>
            </div>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrapper}>
                  <Calendar className={styles.stepIconSVG} size={32} />
                </div>
                <h3>1. Book an appointment</h3>
                <p>Choose a time that works for you. We offer same-day appointments for urgent needs.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrapper}>
                  <User className={styles.stepIconSVG} size={32} />
                </div>
                <h3>2. See your doctor</h3>
                <p>Consult with our board-certified doctors via video, audio, or visit our clinic.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrapper}>
                  <Pill className={styles.stepIconSVG} size={32} />
                </div>
                <h3>3. Get your treatment</h3>
                <p>Receive your diagnosis, prescription, and follow-up care plan immediately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className={styles.servicesSection}>
          <div className={styles.container}>
            <div className={styles.servicesHeader}>
              <h2 className={styles.sectionTitle}>What we treat</h2>
              <p className={styles.sectionSub}>From everyday care to chronic conditions, we've got you covered.</p>
            </div>
            <div className={styles.servicesGrid}>
              {services.map((s) => (
                <div key={s.name} className={styles.serviceItem}>
                  <div className={styles.serviceIcon}>{s.icon}</div>
                  <div className={styles.serviceInfo}>
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT / VALUE PROP */}
        <section className={styles.valueSection}>
          <div className={styles.container}>
            <div className={styles.valueGrid}>
              <div className={styles.valueImage}>
                <div className={styles.valueBgShape}></div>
                <div className={styles.valueContentBox}>
                  <h3>Quality Care. Guaranteed.</h3>
                  <p>Our rigorous vetting process ensures you only see the best doctors.</p>
                </div>
              </div>
              <div className={styles.valueText}>
                <h2 className={styles.sectionTitle}>Healthcare that puts you first</h2>
                <ul className={styles.valueList}>
                  <li>
                    <CheckCircle2 className={styles.checkIcon} size={24} />
                    <div>
                      <strong>Top 5% of doctors</strong>
                      <p>Our physicians are highly experienced and board-certified.</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 className={styles.checkIcon} size={24} />
                    <div>
                      <strong>Affordable & transparent</strong>
                      <p>Clear pricing with no hidden fees, with or without insurance.</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 className={styles.checkIcon} size={24} />
                    <div>
                      <strong>Care from anywhere</strong>
                      <p>Access your medical records and consult from any device.</p>
                    </div>
                  </li>
                </ul>
                <Link href="/book">
                  <button className={styles.btnSecondary}>Get Started Today</button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>Nisir Hikimina</div>
              <p>Providing exceptional healthcare services across Ethiopia and beyond.</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Services</h4>
                <a href="#">Urgent Care</a>
                <a href="#">Primary Care</a>
                <a href="#">Mental Health</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} Nisir Hikimina. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
