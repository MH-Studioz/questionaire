/* ============================================================================
   QUESTIONAIRE — expanded-physical.js
   Physics, chemistry and astronomy catalogue expansion.
   ========================================================================== */

(function () {
  "use strict";

  const add = window.QuestionaireExpanded && window.QuestionaireExpanded.add;
  if (!add) return;

  add("sciences", [
    ["classical-mechanics", "Classical Mechanics", "Intermediate", "Forces, motion, energy, momentum and the mechanics of everyday bodies.", ["Newton's laws", "momentum", "energy", "torque", "oscillations"], "physics"],
    ["kinematics-dynamics", "Kinematics & Dynamics", "Beginner", "Describing motion and explaining it with forces.", ["displacement", "velocity", "acceleration", "free fall", "force diagrams"], "physics"],
    ["thermodynamics", "Thermodynamics", "Intermediate", "Heat, work, entropy and the laws that constrain energy conversion.", ["heat", "work", "entropy", "internal energy", "thermodynamic cycles"], "physics"],
    ["statistical-mechanics", "Statistical Mechanics", "Advanced", "Microstates, ensembles, partition functions and emergent thermal behaviour.", ["microstates", "ensembles", "partition function", "Boltzmann distribution", "entropy"]],
    ["electromagnetism", "Electromagnetism", "Intermediate", "Electric fields, magnetic fields, circuits and electromagnetic induction.", ["electric field", "magnetic field", "Coulomb's law", "induction", "Maxwell's equations"], "physics"],
    ["optics-photonics", "Optics & Photonics", "Advanced", "Light, lenses, interference, diffraction and photonic devices.", ["refraction", "interference", "diffraction", "polarisation", "photons"]],
    ["acoustics", "Acoustics", "Intermediate", "Sound waves, resonance, intensity and room acoustics.", ["sound waves", "frequency", "resonance", "intensity", "harmonics"], "physics"],
    ["fluid-mechanics", "Fluid Mechanics", "Advanced", "Pressure, buoyancy, viscosity, laminar flow and aerodynamics.", ["pressure", "buoyancy", "viscosity", "Bernoulli's principle", "turbulence"]],
    ["special-relativity", "Special Relativity", "Advanced", "Invariant intervals, time dilation, length contraction and mass-energy.", ["Lorentz transformations", "time dilation", "length contraction", "spacetime", "mass-energy equivalence"]],
    ["general-relativity", "General Relativity", "Advanced", "Curved spacetime, geodesics, black holes and gravitational waves.", ["spacetime curvature", "geodesics", "Einstein field equations", "black holes", "gravitational waves"]],
    ["quantum-field-theory", "Quantum Field Theory", "Advanced", "Fields, quanta, gauge symmetry and the standard model.", ["quantum fields", "gauge symmetry", "Feynman diagrams", "renormalisation", "standard model"]],
    ["quantum-computing", "Quantum Computing", "Advanced", "Qubits, superposition, entanglement, gates and quantum algorithms.", ["qubits", "superposition", "entanglement", "quantum gates", "quantum algorithms"]],
    ["particle-physics", "Particle Physics", "Advanced", "Fundamental particles, interactions and the standard model.", ["quarks", "leptons", "bosons", "standard model", "colliders"]],
    ["nuclear-physics", "Nuclear Physics", "Advanced", "Nuclei, radioactivity, fission, fusion and binding energy.", ["radioactivity", "fission", "fusion", "binding energy", "half-life"]],
    ["atomic-molecular-optical-physics", "Atomic, Molecular & Optical Physics", "Advanced", "Atomic structure, spectra, lasers and light-matter interaction.", ["atomic spectra", "lasers", "molecular bonds", "light-matter interaction", "quantum states"]],
    ["condensed-matter-physics", "Condensed Matter Physics", "Advanced", "Crystals, phonons, band structure and collective states.", ["crystal lattice", "phonons", "band structure", "superconductivity", "semiconductors"]],
    ["plasma-physics", "Plasma Physics", "Advanced", "Ionised gases, magnetic confinement and plasma waves.", ["plasma", "ionisation", "magnetic confinement", "plasma waves", "fusion plasmas"]],
    ["biophysics", "Biophysics", "Advanced", "Physical principles in cells, proteins, membranes and molecular motors.", ["molecular motors", "membrane mechanics", "protein folding", "diffusion", "biomechanics"]],
    ["geophysics", "Geophysics", "Advanced", "Earth's interior, seismic waves, gravity and magnetic fields.", ["seismic waves", "gravity anomalies", "geomagnetism", "plate motion", "Earth structure"]],
    ["medical-physics", "Medical Physics", "Advanced", "Radiation, imaging, dosimetry and physics in medicine.", ["radiation dosimetry", "MRI", "CT imaging", "ultrasound", "radiotherapy"]],
    ["string-theory", "String Theory", "Advanced", "Strings, branes, extra dimensions and unification.", ["strings", "branes", "extra dimensions", "supersymmetry", "compactification"]],
    ["inorganic-chemistry", "Inorganic Chemistry", "Intermediate", "Coordination compounds, transition metals and periodic trends.", ["coordination compounds", "transition metals", "ligands", "periodic trends", "oxidation states"]],
    ["physical-chemistry", "Physical Chemistry", "Advanced", "Thermodynamics, kinetics, quantum chemistry and spectroscopy.", ["chemical thermodynamics", "kinetics", "quantum chemistry", "spectroscopy", "equilibria"]],
    ["analytical-chemistry", "Analytical Chemistry", "Intermediate", "Measurement, separation, titration and instrumental analysis.", ["titration", "chromatography", "spectroscopy", "calibration", "detection limits"]],
    ["biochemistry", "Biochemistry", "Advanced", "Biomolecules, metabolism, enzymes and information flow.", ["proteins", "enzymes", "metabolism", "nucleic acids", "bioenergetics"]],
    ["quantum-chemistry", "Quantum Chemistry", "Advanced", "Wavefunctions, orbitals, bonding and computational quantum methods.", ["wavefunctions", "orbitals", "molecular bonding", "Schrodinger equation", "electron correlation"]],
    ["theoretical-computational-chemistry", "Theoretical & Computational Chemistry", "Advanced", "Molecular modelling, simulation and computational electronic structure.", ["molecular modelling", "density functional theory", "molecular dynamics", "basis sets", "simulation"]],
    ["nuclear-chemistry", "Nuclear Chemistry", "Advanced", "Radioactivity, nuclear reactions, tracers and radiochemistry.", ["radioisotopes", "nuclear decay", "tracers", "radiation chemistry", "nuclear reactions"]],
    ["electrochemistry", "Electrochemistry", "Advanced", "Redox reactions, cells, electrodes and electrolysis.", ["redox", "electrochemical cells", "electrodes", "electrolysis", "Nernst equation"]],
    ["thermochemistry", "Thermochemistry", "Intermediate", "Enthalpy, calorimetry, bond energy and reaction heat.", ["enthalpy", "calorimetry", "bond energy", "exothermic", "Hess's law"]],
    ["photochemistry", "Photochemistry", "Advanced", "Light-driven reactions, excited states and photochemical pathways.", ["excited states", "photons", "photolysis", "fluorescence", "photosensitisation"]],
    ["polymer-chemistry", "Polymer Chemistry", "Advanced", "Monomers, polymerisation, chains and material properties.", ["monomers", "polymerisation", "cross-linking", "chain length", "thermoplastics"]],
    ["materials-chemistry", "Materials Chemistry", "Advanced", "Structure-property relationships in ceramics, metals and composites.", ["crystal structure", "composites", "ceramics", "defects", "materials properties"]],
    ["environmental-chemistry", "Environmental Chemistry", "Advanced", "Pollutants, cycles, water chemistry and atmospheric reactions.", ["pollutants", "biogeochemical cycles", "water quality", "atmospheric chemistry", "remediation"]],
    ["medicinal-chemistry", "Medicinal Chemistry", "Advanced", "Drug design, targets, pharmacokinetics and structure-activity.", ["drug targets", "pharmacophores", "structure-activity", "bioavailability", "drug design"]],
    ["geochemistry", "Geochemistry", "Advanced", "Element distribution, isotopes, minerals and Earth processes.", ["isotopes", "element distribution", "mineral chemistry", "weathering", "geochemical cycles"]],
    ["astrochemistry", "Astrochemistry", "Advanced", "Molecules in space, interstellar chemistry and spectral detection.", ["interstellar molecules", "spectral lines", "reaction networks", "dust grains", "star formation"]],
    ["supramolecular-chemistry", "Supramolecular Chemistry", "Advanced", "Non-covalent interactions, hosts, guests and self-assembly.", ["non-covalent interactions", "host-guest chemistry", "self-assembly", "molecular recognition", "catenanes"]],
    ["chemical-kinetics", "Chemical Kinetics", "Advanced", "Reaction rates, mechanisms, catalysts and activation energy.", ["reaction rates", "rate laws", "activation energy", "catalysis", "mechanisms"]],
    ["spectroscopy", "Spectroscopy", "Advanced", "Absorption, emission, NMR, IR and mass spectra.", ["absorption", "emission", "NMR", "infrared", "mass spectrometry"]],
    ["observational-astronomy", "Observational Astronomy", "Intermediate", "Telescopes, detectors, photometry and sky surveys.", ["telescopes", "detectors", "photometry", "sky surveys", "astronomical imaging"]],
    ["astrophysics", "Astrophysics", "Advanced", "Stellar structure, radiation, compact objects and cosmic processes.", ["stellar structure", "radiation", "compact objects", "accretion", "nucleosynthesis"]],
    ["cosmology", "Cosmology", "Advanced", "Expansion, dark matter, dark energy and the early universe.", ["cosmic expansion", "dark matter", "dark energy", "big bang", "cosmic microwave background"]],
    ["planetary-science", "Planetary Science", "Advanced", "Planet formation, atmospheres, surfaces and small bodies.", ["planet formation", "atmospheres", "orbital dynamics", "small bodies", "planetary surfaces"]],
    ["stellar-astronomy", "Stellar Astronomy", "Advanced", "Star formation, evolution, spectra and stellar remnants.", ["star formation", "stellar evolution", "spectral classes", "supernovae", "white dwarfs"]],
    ["galactic-extragalactic-astronomy", "Galactic & Extragalactic Astronomy", "Advanced", "Galaxies, structure, evolution and large-scale surveys.", ["galaxy structure", "galaxy evolution", "redshift", "active galactic nuclei", "large-scale structure"]],
    ["heliophysics", "Heliophysics", "Advanced", "The Sun, solar activity, space weather and heliosphere.", ["solar activity", "sunspots", "solar wind", "space weather", "heliosphere"]],
    ["astrometry", "Astrometry", "Advanced", "Precise positions, parallax, proper motion and celestial reference frames.", ["parallax", "proper motion", "reference frames", "celestial coordinates", "position measurement"]],
    ["celestial-mechanics", "Celestial Mechanics", "Advanced", "Orbits, gravitational dynamics, resonances and perturbation theory.", ["orbits", "Kepler's laws", "resonances", "perturbations", "three-body problem"]]
  ]);
})();
