/* ============================================================================
   QUESTIONAIRE — questions/sciences/physics.js
   Conceptual physics for the algebra-based, thermodynamics, electromagnetism,
   quantum and acoustics courses. The AP Physics C mechanics and kinematics
   courses keep their numerical generator.
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "physics",
    area: "sciences",
    title: "Physics",
    subjects: [
      "ap-physics-1", "ap-physics-2", "ap-physics-c-mechanics", "ap-physics-c-electricity-magnetism",
      "classical-physics", "classical-mechanics", "kinematics-dynamics", "thermodynamics",
      "electromagnetism", "quantum-mechanics", "acoustics"
    ],
    facts: [
      ["What is Newton's second law?", "Net force equals mass times acceleration", ["Every action has an equal and opposite reaction", "Objects at rest stay at rest", "Energy is always conserved"], "F = ma relates net force, mass and acceleration."],
      ["What is Newton's third law?", "Every action has an equal and opposite reaction", ["Force equals mass times acceleration", "Objects resist changes in motion", "Energy cannot be created"], "Forces act in pairs on different bodies."],
      ["Which quantity is a vector?", "Velocity", ["Speed", "Mass", "Temperature"], "Velocity has magnitude and direction."],
      ["What happens to kinetic energy when speed doubles?", "It quadruples", ["It doubles", "It halves", "It stays the same"], "Kinetic energy is ½mv², so doubling v multiplies energy by four."],
      ["What is the unit of electrical resistance?", "Ohm", ["Volt", "Ampere", "Watt"], "Resistance is measured in ohms."],
      ["Which circuit type has one path for current?", "Series circuit", ["Parallel circuit", "Open circuit", "Short circuit"], "A series circuit provides a single path."],
      ["What is the relationship between voltage, current and resistance?", "V = IR", ["V = I/R", "I = VR", "R = VI"], "Ohm's law links the three quantities."],
      ["What is work in physics?", "Force applied over a displacement", ["Any effort over time", "Energy stored in a battery", "The rate of force"], "Work equals force times displacement in the force's direction."],
      ["What is power?", "The rate at which work is done or energy transferred", ["The total energy used", "The force applied", "The distance moved"], "Power is work divided by time."],
      ["What is the first law of thermodynamics?", "Energy is conserved; internal energy changes by heat and work", ["Entropy always decreases", "Heat cannot flow", "Energy is destroyed in engines"], "ΔU = Q − W for a system."],
      ["Which heat transfer method works through direct contact?", "Conduction", ["Convection", "Radiation", "Evaporation"], "Conduction transfers energy through collisions."],
      ["What is the speed of light in a vacuum?", "About 3 × 10⁸ m/s", ["About 3 × 10⁶ m/s", "About 3 × 10¹⁰ m/s", "About 340 m/s"], "Light travels at roughly 300,000 km/s."],
      ["Does sound travel through a vacuum?", "No, sound needs a medium", ["Yes, at the speed of light", "Yes, but only as light", "Only at absolute zero"], "Sound is a mechanical wave."],
      ["What is the period of a wave?", "The time for one complete cycle", ["The number of cycles per second", "The height of the wave", "The distance between crests"], "Frequency is the reciprocal of period."],
      ["What is refraction?", "The bending of a wave as its speed changes between media", ["The reflection of a wave", "The absorption of light", "The splitting of an atom"], "Snell's law describes the change of direction."],
      ["What is momentum?", "Mass times velocity", ["Mass times acceleration", "Force times time", "Energy divided by time"], "Momentum is conserved in closed systems."],
      ["What is an electric field?", "The force per unit charge at a point", ["The total charge in a region", "The resistance of a wire", "The magnetic flux"], "Fields describe forces on charges."],
      ["Which particles carry a negative charge?", "Electrons", ["Protons", "Neutrons", "Photons"], "Electrons orbit nuclei and carry −1e."],
      ["What does the photoelectric effect show?", "Light delivers energy in discrete quanta", ["Light is a continuous wave only", "Electrons have no charge", "Energy is not conserved"], "Photons above a threshold eject electrons."],
      ["What is entropy?", "A measure of disorder or unavailable energy", ["The total heat of a system", "The speed of particles", "The force between charges"], "Entropy tends to increase in isolated systems."],
      ["What is resonance?", "A large response when a system is driven at its natural frequency", ["The reflection of sound", "The bending of light", "The decay of a wave"], "Resonance amplifies oscillation amplitude."],
      ["What is the difference between mass and weight?", "Mass is matter; weight is the gravitational force on it", ["They are the same quantity", "Weight is constant everywhere", "Mass changes with location"], "Weight equals mg."]
    ]
  });
})();
