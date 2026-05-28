import { motion } from 'framer-motion';
import { Cable, Layers3, MoveRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { title: 'Choose rack size', icon: Layers3, text: '4U through 24U studio frames' },
  { title: 'Drag devices', icon: SlidersHorizontal, text: 'Build the signal chain' },
  { title: 'Patch connections', icon: Cable, text: 'Validate every route' },
];

export function LandingPage() {
  return (
    <main className="landing">
      <div aria-hidden className="landing-rack">
        {['PREAMP / 01', 'DYNAMICS', 'AD / DA', 'PATCH BAY', 'MONITOR'].map((label, index) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="landing-rack__unit"
            initial={{ opacity: 0, x: 24 }}
            key={label}
            transition={{ delay: 0.25 + index * 0.09 }}
          >
            <span>{label}</span>
            <i />
            <i />
            <i className={index === 2 ? 'active' : ''} />
          </motion.div>
        ))}
      </div>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="landing__content"
        initial={{ opacity: 0, y: 14 }}
      >
        <p className="eyebrow">STUDIO ROUTING WORKSPACE</p>
        <h1>Plug-I/O</h1>
        <p className="landing__tagline">
          Build, wire and verify a professional studio rack in one precise visual workspace.
        </p>
        <Link className="launch-button" to="/editor">
          Start building <MoveRight size={18} />
        </Link>
        <div className="landing__steps">
          {steps.map(({ title, text, icon: Icon }, index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              key={title}
              transition={{ delay: 0.35 + index * 0.1 }}
            >
              <Icon aria-hidden size={21} />
              <strong>{title}</strong>
              <span>{text}</span>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
