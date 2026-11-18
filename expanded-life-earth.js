/* ============================================================================
   QUESTIONAIRE — expanded-life-earth.js
   Biology, ecology and Earth-system catalogue expansion.
   ========================================================================== */

(function () {
  "use strict";

  const add = window.QuestionaireExpanded && window.QuestionaireExpanded.add;
  if (!add) return;

  add("sciences", [
    ["cell-biology", "Cell Biology", "Intermediate", "Membranes, organelles, cell signalling and the cell cycle.", ["cell membrane", "organelles", "cell signalling", "mitosis", "cytoskeleton"]],
    ["molecular-biology", "Molecular Biology", "Advanced", "DNA, RNA, proteins and the molecular machinery of life.", ["DNA replication", "transcription", "translation", "gene regulation", "proteins"]],
    ["genetics", "Genetics", "Intermediate", "Inheritance, alleles, linkage, mutation and genetic variation.", ["alleles", "inheritance", "linkage", "mutation", "phenotype"]],
    ["genomics-proteomics", "Genomics & Proteomics", "Advanced", "Genomes, sequencing, gene expression and protein-scale analysis.", ["genome sequencing", "gene expression", "proteomics", "bioinformatics", "variants"]],
    ["epigenetics", "Epigenetics", "Advanced", "Heritable changes in gene expression without DNA sequence change.", ["DNA methylation", "histone modification", "chromatin", "gene silencing", "imprinting"]],
    ["evolutionary-biology", "Evolutionary Biology", "Advanced", "Natural selection, drift, speciation and phylogenetic change.", ["natural selection", "genetic drift", "speciation", "fitness", "phylogeny"]],
    ["developmental-biology", "Developmental Biology", "Advanced", "Embryonic patterning, differentiation and morphogenesis.", ["embryogenesis", "differentiation", "morphogens", "body plan", "morphogenesis"]],
    ["bacteriology", "Bacteriology", "Advanced", "Bacterial structure, growth, genetics and pathogenesis.", ["bacteria", "peptidoglycan", "binary fission", "plasmids", "pathogenesis"]],
    ["virology", "Virology", "Advanced", "Virus structure, replication, transmission and immunity.", ["virions", "viral replication", "host range", "vaccines", "antivirals"]],
    ["mycology", "Mycology", "Advanced", "Fungi, hyphae, spores, symbiosis and fungal disease.", ["fungi", "hyphae", "spores", "mycorrhizae", "fungal pathogens"]],
    ["parasitology", "Parasitology", "Advanced", "Parasite life cycles, hosts, vectors and disease.", ["parasites", "life cycles", "hosts", "vectors", "antiparasitic drugs"]],
    ["botany", "Botany", "Intermediate", "Plant structure, growth, reproduction and diversity.", ["photosynthesis", "vascular tissue", "flowers", "seeds", "plant taxonomy"]],
    ["plant-physiology", "Plant Physiology", "Advanced", "Water transport, photosynthesis, hormones and plant responses.", ["transpiration", "photosynthesis", "plant hormones", "tropisms", "xylem"]],
    ["zoology", "Zoology", "Intermediate", "Animal diversity, form, function and behaviour.", ["animal diversity", "body plans", "physiology", "behaviour", "taxonomy"]],
    ["entomology", "Entomology", "Advanced", "Insect anatomy, metamorphosis, ecology and classification.", ["insects", "metamorphosis", "exoskeleton", "pollination", "insect orders"]],
    ["ornithology", "Ornithology", "Advanced", "Bird evolution, anatomy, migration and behaviour.", ["birds", "feathers", "migration", "flight", "birdsong"]],
    ["ichthyology", "Ichthyology", "Advanced", "Fish diversity, anatomy, physiology and aquatic adaptation.", ["fish", "gills", "swim bladder", "lateral line", "fish diversity"]],
    ["herpetology", "Herpetology", "Advanced", "Reptiles and amphibians: form, ecology and conservation.", ["reptiles", "amphibians", "ectothermy", "metamorphosis", "venom"]],
    ["mammalogy", "Mammalogy", "Advanced", "Mammalian evolution, anatomy, behaviour and diversity.", ["mammals", "mammary glands", "dentition", "endothermy", "mammalian orders"]],
    ["marine-biology", "Marine Biology", "Advanced", "Ocean life, marine ecosystems and human impacts.", ["marine ecosystems", "plankton", "coral reefs", "ocean acidification", "fisheries"]],
    ["ecology", "Ecology", "Intermediate", "Populations, communities, ecosystems and energy flow.", ["populations", "communities", "food webs", "nutrient cycles", "biodiversity"]],
    ["conservation-biology", "Conservation Biology", "Advanced", "Biodiversity loss, protected areas and restoration.", ["biodiversity", "habitat loss", "protected areas", "restoration", "extinction risk"]],
    ["neurobiology-neuroscience", "Neurobiology & Neuroscience", "Advanced", "Neurons, synapses, circuits and nervous-system function.", ["neurons", "synapses", "action potentials", "neural circuits", "neurotransmitters"]],
    ["cognitive-neuroscience", "Cognitive Neuroscience", "Advanced", "Brain systems behind perception, memory, language and decision.", ["brain imaging", "memory", "attention", "language", "decision making"]],
    ["immunology", "Immunology", "Advanced", "Innate and adaptive immunity, antibodies and immune memory.", ["innate immunity", "antibodies", "T cells", "immune memory", "inflammation"]],
    ["histology", "Histology", "Advanced", "Tissue structure, staining and microscopic organisation.", ["epithelium", "connective tissue", "muscle tissue", "staining", "microscopy"]],
    ["pathology", "Pathology", "Advanced", "Disease mechanisms, tissue change and diagnosis.", ["disease mechanisms", "inflammation", "neoplasia", "biopsy", "diagnosis"]],
    ["taxonomy-systematics", "Taxonomy & Systematics", "Advanced", "Classification, phylogeny, nomenclature and species concepts.", ["classification", "phylogeny", "nomenclature", "species concepts", "cladistics"]],
    ["astrobiology", "Astrobiology", "Advanced", "Habitability, biosignatures and the search for life beyond Earth.", ["habitability", "biosignatures", "extremophiles", "exoplanets", "origin of life"]],
    ["synthetic-biology", "Synthetic Biology", "Advanced", "Engineering genetic circuits, chassis organisms and biomanufacturing.", ["genetic circuits", "chassis organisms", "CRISPR", "biomanufacturing", "standard parts"]],
    ["systems-biology", "Systems Biology", "Advanced", "Network models, omics data and emergent biological behaviour.", ["biological networks", "omics", "feedback loops", "modelling", "emergent behaviour"]],
    ["geology", "Geology", "Intermediate", "Earth materials, structures, processes and deep time.", ["rock cycle", "plate tectonics", "stratigraphy", "minerals", "geologic time"]],
    ["mineralogy", "Mineralogy", "Advanced", "Mineral structure, composition, identification and occurrence.", ["crystal structure", "mineral identification", "silicates", "cleavage", "optical properties"]],
    ["petrology", "Petrology", "Advanced", "Igneous, sedimentary and metamorphic rocks and their origins.", ["igneous rocks", "sedimentary rocks", "metamorphic rocks", "magma", "texture"]],
    ["paleontology", "Paleontology", "Advanced", "Fossils, ancient life, extinction and evolutionary history.", ["fossils", "stratigraphic range", "extinction", "paleoecology", "trace fossils"]],
    ["stratigraphy", "Stratigraphy", "Advanced", "Layering, correlation, relative dating and basin history.", ["strata", "correlation", "relative dating", "unconformities", "biostratigraphy"]],
    ["sedimentology", "Sedimentology", "Advanced", "Sediment transport, depositional environments and sedimentary structures.", ["sediment transport", "depositional environments", "grain size", "cross-bedding", "diagenesis"]],
    ["structural-geology-tectonics", "Structural Geology & Tectonics", "Advanced", "Folds, faults, stress and plate-boundary deformation.", ["folds", "faults", "stress", "plate boundaries", "deformation"]],
    ["volcanology", "Volcanology", "Advanced", "Magma, eruptions, volcanic hazards and landforms.", ["magma", "eruption styles", "lava", "pyroclastic flows", "volcanic hazards"]],
    ["seismology", "Seismology", "Advanced", "Earthquakes, seismic waves and imaging Earth's interior.", ["seismic waves", "earthquakes", "fault rupture", "seismographs", "Earth structure"]],
    ["glaciology", "Glaciology", "Advanced", "Ice sheets, glaciers, mass balance and sea-level change.", ["glaciers", "ice sheets", "mass balance", "crevasses", "sea level"]],
    ["hydrology", "Hydrology", "Advanced", "The water cycle, catchments, groundwater and streamflow.", ["water cycle", "catchments", "groundwater", "streamflow", "infiltration"]],
    ["oceanography", "Oceanography", "Advanced", "Ocean physics, chemistry, biology and geology.", ["ocean circulation", "salinity", "waves", "tides", "marine sediments"]],
    ["limnology", "Limnology", "Advanced", "Lakes, rivers, freshwater chemistry and aquatic ecology.", ["lakes", "stratification", "freshwater chemistry", "eutrophication", "watersheds"]],
    ["meteorology", "Meteorology", "Advanced", "Atmosphere, weather systems, fronts and forecasting.", ["air masses", "fronts", "pressure systems", "weather forecasting", "storms"]],
    ["climatology", "Climatology", "Advanced", "Climate systems, variability, feedbacks and change.", ["climate feedbacks", "greenhouse effect", "climate variability", "aerosols", "climate models"]],
    ["atmospheric-science", "Atmospheric Science", "Advanced", "Atmospheric structure, chemistry, radiation and dynamics.", ["atmospheric layers", "radiation balance", "atmospheric chemistry", "wind", "aerosols"]],
    ["soil-science", "Soil Science", "Advanced", "Soil formation, texture, fertility and land management.", ["soil horizons", "soil texture", "fertility", "erosion", "soil carbon"]],
    ["geomorphology", "Geomorphology", "Advanced", "Landforms, erosion, rivers, glaciers and landscape evolution.", ["erosion", "landforms", "rivers", "glaciers", "landscape evolution"]],
    ["cartography-gis", "Cartography & GIS", "Advanced", "Maps, projections, spatial data and geographic analysis.", ["map projections", "spatial data", "GIS", "remote sensing", "coordinate systems"]]
  ]);
})();
