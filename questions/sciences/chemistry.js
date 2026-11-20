/* ============================================================================
   QUESTIONAIRE — questions/sciences/chemistry.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "chemistry",
    area: "sciences",
    title: "Chemistry",
    subjects: ["ap-chemistry", "chemistry", "organic-chemistry"],
    facts: [
      ["Which part of the atom determines the element?", "The number of protons", ["The number of neutrons", "The number of electrons", "The atomic mass"], "The proton count is the atomic number and defines the element."],
      ["Which bond involves sharing electron pairs?", "Covalent bond", ["Ionic bond", "Hydrogen bond", "Metallic bond"], "Covalent bonds share electrons between atoms."],
      ["Which bond forms when electrons are transferred between atoms?", "Ionic bond", ["Covalent bond", "Hydrogen bond", "Metallic bond"], "Transfer creates oppositely charged ions that attract."],
      ["What is the pH of a neutral solution at room temperature?", "7", ["0", "14", "1"], "Pure water has a pH of about 7."],
      ["What does the law of conservation of mass state?", "Mass is neither created nor destroyed in a chemical reaction", ["Mass always increases", "Mass becomes energy in every reaction", "Mass depends only on temperature"], "Atoms are rearranged, not created or destroyed."],
      ["Which gas is produced when an acid reacts with a metal?", "Hydrogen", ["Oxygen", "Nitrogen", "Carbon dioxide"], "Acids react with many metals to release hydrogen gas."],
      ["What is an isotope?", "An atom with the same number of protons but different neutrons", ["An atom with a different number of protons", "A molecule with two charges", "An ion with no electrons"], "Isotopes share an element's proton count but differ in neutrons."],
      ["Which is a physical change?", "Melting ice", ["Rusting iron", "Burning wood", "Baking a cake"], "Melting changes state without forming a new substance."],
      ["What is a mole?", "Avogadro's number of particles of a substance", ["One gram of any substance", "One litre of gas", "One molecule of water"], "A mole contains about 6.02 × 10²³ particles."],
      ["What is a catalyst?", "A substance that speeds a reaction without being consumed", ["A reactant used up in a reaction", "A product of combustion", "A solvent"], "Catalysts lower activation energy."],
      ["What is an exothermic reaction?", "One that releases heat to the surroundings", ["One that absorbs heat", "One that produces light only", "One that does not react"], "Exothermic reactions have a negative enthalpy change."],
      ["What is oxidation in terms of electrons?", "Loss of electrons", ["Gain of electrons", "Gain of protons", "Loss of neutrons"], "Oxidation and reduction always occur together."],
      ["What are noble gases known for?", "A full outer electron shell and low reactivity", ["High reactivity with water", "Forming strong acids", "Being radioactive"], "Group 18 elements are largely inert."],
      ["What is the product of an acid-base neutralisation?", "A salt and water", ["An acid and a base", "Only a gas", "Only a metal"], "H⁺ and OH⁻ combine to form water."],
      ["What does an empirical formula show?", "The simplest whole-number ratio of atoms", ["The actual number of atoms in a molecule", "The three-dimensional shape", "The bond angles"], "Molecular formulas may be multiples of the empirical formula."],
      ["Which functional group defines an alcohol?", "Hydroxyl (-OH)", ["Carboxyl (-COOH)", "Carbonyl (C=O)", "Amino (-NH₂)"], "Alcohols contain a hydroxyl group."],
      ["Which functional group defines a carboxylic acid?", "Carboxyl (-COOH)", ["Hydroxyl (-OH)", "Carbonyl (C=O)", "Ester (-COO-)"], "Carboxyl groups donate H⁺ and give acidic character."],
      ["What is the shape of a molecule with four bonding pairs and no lone pairs?", "Tetrahedral", ["Trigonal planar", "Linear", "Bent"], "Four pairs arrange as far apart as possible, tetrahedrally."],
      ["Which intermolecular force is strongest?", "Hydrogen bonding", ["London dispersion forces", "Dipole-dipole forces", "Ion-induced dipole forces"], "Hydrogen bonds between N, O or F and H are comparatively strong."]
    ]
  });
})();
