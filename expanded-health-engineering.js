/* ============================================================================
   QUESTIONAIRE — expanded-health-engineering.js
   Health, medicine and engineering catalogue expansion.
   ========================================================================== */

(function () {
  "use strict";

  const add = window.QuestionaireExpanded && window.QuestionaireExpanded.add;
  if (!add) return;

  add("health", [
    ["medicine", "Medicine", "Advanced", "Diagnosis, treatment and the scientific practice of clinical care.", ["diagnosis", "treatment", "clinical reasoning", "patient history", "evidence-based medicine"]],
    ["pharmacology", "Pharmacology", "Advanced", "Drug actions, receptors, dosing and adverse effects.", ["receptors", "pharmacokinetics", "dose-response", "agonists", "adverse effects"]],
    ["toxicology", "Toxicology", "Advanced", "Poisons, dose, exposure and risk assessment.", ["toxins", "dose-response", "exposure", "biotransformation", "risk assessment"]],
    ["epidemiology", "Epidemiology", "Advanced", "Disease frequency, risk factors and study design.", ["incidence", "prevalence", "cohort studies", "case-control studies", "confounding"]],
    ["public-health", "Public Health", "Intermediate", "Population health, prevention, policy and health systems.", ["prevention", "health policy", "screening", "health systems", "population health"]],
    ["nutrition-science", "Nutrition Science", "Intermediate", "Macronutrients, micronutrients, metabolism and dietary health.", ["macronutrients", "micronutrients", "metabolism", "dietary guidelines", "energy balance"]],
    ["kinesiology-exercise-science", "Kinesiology & Exercise Science", "Intermediate", "Human movement, biomechanics, training and exercise physiology.", ["biomechanics", "muscle physiology", "training", "exercise metabolism", "movement analysis"]],
    ["oncology", "Oncology", "Advanced", "Cancer biology, staging, treatment and survivorship.", ["tumour biology", "staging", "chemotherapy", "radiation therapy", "metastasis"]],
    ["cardiology", "Cardiology", "Advanced", "Heart structure, rhythm, disease and cardiovascular treatment.", ["cardiac cycle", "arrhythmia", "heart failure", "coronary disease", "ECG"]],
    ["neurology", "Neurology", "Advanced", "Nervous-system disorders, localisation and clinical assessment.", ["stroke", "seizures", "neuropathy", "brain lesions", "neurological examination"]],
    ["endocrinology", "Endocrinology", "Advanced", "Hormones, glands, metabolism and endocrine disease.", ["hormones", "feedback loops", "thyroid", "insulin", "endocrine disorders"]],
    ["hematology", "Hematology", "Advanced", "Blood cells, coagulation, anaemia and blood disorders.", ["erythrocytes", "leukocytes", "coagulation", "anaemia", "haematopoiesis"]],
    ["psychiatry", "Psychiatry", "Advanced", "Mental disorders, assessment, psychotherapy and medication.", ["mental status exam", "psychotherapy", "psychopharmacology", "diagnosis", "risk assessment"]],
    ["surgery", "Surgery", "Advanced", "Operative principles, anatomy, sterility and postoperative care.", ["sterile technique", "incisions", "anaesthesia", "haemostasis", "postoperative care"]],
    ["pediatrics", "Pediatrics", "Advanced", "Child development, childhood disease and age-specific care.", ["growth milestones", "vaccination", "neonatology", "child development", "paediatric dosing"]],
    ["veterinary-medicine", "Veterinary Medicine", "Advanced", "Animal health, diagnosis, surgery and zoonoses.", ["animal examination", "vaccination", "zoonoses", "veterinary surgery", "species differences"]],
    ["dentistry", "Dentistry", "Advanced", "Oral anatomy, caries, periodontal disease and dental treatment.", ["enamel", "caries", "periodontal disease", "dental radiography", "restoration"]],
    ["nursing", "Nursing", "Intermediate", "Patient assessment, care planning, safety and clinical communication.", ["patient assessment", "care planning", "medication safety", "infection control", "clinical communication"]],
    ["pharmacy", "Pharmacy", "Advanced", "Medicines, dispensing, interactions and pharmaceutical care.", ["dispensing", "drug interactions", "pharmacotherapy", "adherence", "pharmaceutical care"]]
  ]);

  add("engineering", [
    ["algorithms-data-structures", "Algorithms & Data Structures", "Advanced", "Complexity, arrays, trees, graphs, sorting and algorithm design.", ["complexity", "arrays", "trees", "graphs", "dynamic programming"]],
    ["artificial-intelligence", "Artificial Intelligence & Machine Learning", "Advanced", "Search, learning, inference and intelligent systems.", ["search", "supervised learning", "features", "inference", "model evaluation"]],
    ["deep-learning-nlp", "Deep Learning & NLP", "Advanced", "Neural networks, transformers and language processing.", ["neural networks", "backpropagation", "transformers", "embeddings", "language models"]],
    ["computer-vision", "Computer Vision", "Advanced", "Images, convolution, detection and visual representation.", ["convolution", "image classification", "object detection", "segmentation", "feature extraction"]],
    ["cybersecurity", "Cybersecurity", "Advanced", "Threats, cryptography, access control and secure systems.", ["threat models", "encryption", "access control", "vulnerabilities", "incident response"]],
    ["software-engineering", "Software Engineering", "Advanced", "Requirements, design, testing, version control and maintenance.", ["requirements", "testing", "version control", "design patterns", "maintenance"]],
    ["operating-systems-architecture", "Operating Systems & Architecture", "Advanced", "Processes, memory, scheduling, storage and computer architecture.", ["processes", "virtual memory", "scheduling", "caches", "instruction sets"]],
    ["database-systems", "Database Systems", "Advanced", "Relational models, SQL, transactions and indexing.", ["relational model", "SQL", "transactions", "indexes", "normalisation"]],
    ["computer-networks", "Computer Networks & Distributed Systems", "Advanced", "Protocols, routing, reliability and distributed coordination.", ["TCP/IP", "routing", "latency", "distributed consensus", "network security"]],
    ["human-computer-interaction", "Human-Computer Interaction", "Intermediate", "Usability, interaction design, accessibility and evaluation.", ["usability", "interaction design", "accessibility", "user research", "evaluation"]],
    ["theory-of-computation", "Theory of Computation & Compilers", "Advanced", "Automata, formal languages, computability and compilation.", ["automata", "formal languages", "Turing machines", "parsing", "code generation"]],
    ["mechanical-engineering", "Mechanical Engineering", "Advanced", "Statics, dynamics, materials, machines and thermal systems.", ["statics", "dynamics", "thermodynamics", "machine design", "manufacturing"]],
    ["electrical-engineering", "Electrical Engineering", "Advanced", "Circuits, signals, electronics and power systems.", ["circuits", "signals", "electronics", "power systems", "control"]],
    ["civil-engineering", "Civil Engineering", "Advanced", "Structures, materials, geotechnics and infrastructure.", ["structural analysis", "concrete", "geotechnics", "transport", "water systems"]],
    ["chemical-engineering", "Chemical Engineering", "Advanced", "Reaction engineering, separation, transport and process design.", ["reactor design", "separation", "mass transfer", "process control", "scale-up"]],
    ["aerospace-engineering", "Aerospace Engineering", "Advanced", "Aerodynamics, propulsion, structures and flight mechanics.", ["aerodynamics", "propulsion", "flight mechanics", "orbital mechanics", "structures"]],
    ["biomedical-engineering", "Biomedical Engineering", "Advanced", "Medical devices, biomaterials, imaging and biomechanics.", ["biomaterials", "medical imaging", "biomechanics", "prosthetics", "device safety"]],
    ["materials-science-engineering", "Materials Science & Engineering", "Advanced", "Structure, properties, processing and selection of materials.", ["crystal structure", "alloys", "polymers", "failure", "materials selection"]],
    ["environmental-engineering", "Environmental Engineering", "Advanced", "Water, air, waste and sustainable treatment systems.", ["water treatment", "air pollution", "wastewater", "remediation", "sustainability"]],
    ["nuclear-engineering", "Nuclear Engineering", "Advanced", "Fission, reactors, radiation shielding and fuel cycles.", ["fission", "reactor cores", "radiation shielding", "fuel cycle", "safety systems"]],
    ["robotics-mechatronics", "Robotics & Mechatronics", "Advanced", "Sensors, actuators, control and integrated machines.", ["kinematics", "actuators", "sensors", "control loops", "embedded systems"]],
    ["nanotechnology", "Nanotechnology", "Advanced", "Nanoscale materials, fabrication and quantum effects.", ["nanoparticles", "self-assembly", "lithography", "surface area", "quantum effects"]],
    ["industrial-systems-engineering", "Industrial & Systems Engineering", "Advanced", "Processes, optimisation, logistics and systems thinking.", ["optimization", "logistics", "queueing", "process improvement", "systems thinking"]]
  ]);
})();
