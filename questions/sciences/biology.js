/* ============================================================================
   QUESTIONAIRE — questions/sciences/biology.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "biology",
    area: "sciences",
    title: "Biology",
    subjects: ["ap-biology", "biology", "microbiology"],
    facts: [
      ["Which organelle produces most of the ATP in a eukaryotic cell?", "Mitochondrion", ["Nucleus", "Ribosome", "Golgi apparatus"], "Mitochondria carry out aerobic respiration and generate most ATP."],
      ["What is the role of ribosomes?", "They assemble proteins from amino acids", ["They store genetic information", "They break down lipids", "They package proteins for export"], "Ribosomes translate mRNA into polypeptide chains."],
      ["Which process converts light energy into chemical energy in plants?", "Photosynthesis", ["Cellular respiration", "Fermentation", "Transpiration"], "Photosynthesis uses light, water and carbon dioxide to make glucose."],
      ["What is the main function of DNA?", "It stores hereditary information", ["It catalyses all reactions", "It forms the cell membrane", "It transports oxygen"], "DNA carries the instructions for proteins and inheritance."],
      ["What happens during mitosis?", "One cell divides into two genetically identical cells", ["Four genetically unique gametes form", "DNA is replicated without division", "Chromosomes are halved"], "Mitosis produces identical daughter cells for growth and repair."],
      ["What happens during meiosis?", "Four genetically varied gametes form with half the chromosome number", ["Two identical cells form", "Chromosomes double", "No DNA is copied"], "Meiosis halves the chromosome number and creates variation."],
      ["What is an enzyme?", "A protein that speeds up a reaction without being consumed", ["A lipid that stores energy", "A sugar used for fuel", "A nucleic acid that stores information"], "Enzymes lower activation energy and are reusable."],
      ["What is homeostasis?", "Maintaining a stable internal environment", ["Producing offspring", "Growing irreversibly", "Responding only to light"], "Homeostasis keeps temperature, pH and other conditions within workable ranges."],
      ["What is natural selection?", "Heritable variants that improve survival reproduce more", ["Organisms choose to adapt", "All mutations are harmful", "Species change at random"], "Differential reproduction changes allele frequencies."],
      ["What causes antibiotic resistance to spread?", "Natural selection favouring resistant bacteria", ["Bacteria learning to avoid drugs", "Vaccines changing bacterial DNA", "Antibiotics creating new species instantly"], "Resistant variants survive treatment and reproduce."],
      ["Which molecule is the main energy currency of the cell?", "ATP", ["DNA", "Glucose", "Haemoglobin"], "ATP releases usable energy when its phosphate bonds are broken."],
      ["What is diffusion?", "Net movement of particles from high to low concentration", ["Movement of water across a membrane", "Active transport against a gradient", "Movement of whole cells"], "Diffusion needs no energy input."],
      ["What is osmosis?", "Diffusion of water across a selectively permeable membrane", ["Movement of solutes through a membrane", "Active pumping of ions", "Evaporation from a leaf"], "Water moves toward higher solute concentration."],
      ["What do antibodies do?", "Bind specific antigens to mark them for destruction", ["Digest food in the stomach", "Carry oxygen in blood", "Store genetic information"], "Antibodies are produced by B cells."],
      ["What is the role of a neuron?", "Transmit electrical signals through the nervous system", ["Produce hormones", "Store fat", "Filter blood"], "Neurons carry impulses along axons."],
      ["What is a dominant allele?", "An allele expressed when one copy is present", ["An allele expressed only when two copies are present", "An allele that never affects phenotype", "A mutation with no effect"], "A single dominant allele is enough for its trait to appear."],
      ["Which blood vessels carry blood away from the heart?", "Arteries", ["Veins", "Capillaries", "Lymph vessels"], "Arteries carry blood away from the heart; veins return it."],
      ["What is the function of the cell membrane?", "Control what enters and leaves the cell", ["Store DNA", "Make ATP", "Synthesise proteins"], "The membrane is selectively permeable."],
      ["Which process makes glucose from carbon dioxide in the Calvin cycle?", "The light-independent reactions of photosynthesis", ["Glycolysis", "The Krebs cycle", "Fermentation"], "The Calvin cycle fixes carbon using ATP and NADPH."]
    ]
  });
})();
