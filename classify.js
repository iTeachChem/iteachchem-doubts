// classify.js — NCERT/JEE chapter + subsection classifier for iTeachChem doubts.
// classify(subject, title) -> {ch, chLabel, sub, subLabel, conf}
// conf: 2 = strong keyword match, 1 = generic chapter hit, 0 = no signal (Uncategorized).
// Subject (s) is trusted from existing Discord-tag data; this refines chapter/subsection within it.
const rx = (s) => new RegExp(s, 'i');

const TAX = {
  chemistry: [
    ['org_goc','Organic: GOC',[
      ['goc','GOC / Effects', rx('\\bgoc\\b|inductive|hyperconjug|resonance|mesomeric|electromeric|electrophil|nucleophil(?!ic sub)|\\bacidity\\b|\\bbasicity\\b|acidic strength|stability of (carbo|free|radical)|carbocation|carbanion|electron(?:ic)? (?:displacement|effect)|\\bngp\\b|neighbouring group')],
    ]],
    ['org_isomerism','Organic: Isomerism & Stereo',[
      ['stereo','Stereochemistry', rx('stereo|chirali|chiral|enantiomer|diastereomer|\\br[\\/ ]?s\\b|\\br/s config|\\be[\\/ ]?z\\b|optical iso|conformer|conformation|newman|fischer|racem|meso')],
      ['isomerism','Isomerism', rx('isomeris|isomer|tautomer|metameris')],
    ]],
    ['org_nomen','Organic: IUPAC Nomenclature',[
      ['iupac','IUPAC Naming', rx('iupac|nomenclature|naming')],
    ]],
    ['org_hc','Organic: Hydrocarbons',[
      ['aromatic','Aromatic / Benzene', rx('aromatic|aromatici|benzene|huckel|\\beas\\b|electrophilic aromatic|friedel|toluene|xylene|naphtha|phenyl(?!a)')],
      ['alkyne','Alkynes', rx('alkyne|\\bacetylen')],
      ['alkene','Alkenes', rx('alkene|\\bolefin|markovnikov|ozonolysis|hydroboration')],
      ['alkane','Alkanes', rx('alkane|paraffin|wurtz')],
      ['hc_gen','Hydrocarbons (general)', rx('hydrocarbon|aliphatic|cycloalk|saytzeff|zaitsev')],
    ]],
    ['org_halide','Organic: Haloalkanes & Haloarenes',[
      ['sn','Substitution / Elimination', rx('\\bsn1\\b|\\bsn2\\b|\\bsnae\\b|\\be1\\b|\\be2\\b|\\bsn ?ar\\b|nucleophilic sub|dehydrohalogen|elimination reaction')],
      ['halide','Alkyl / Aryl Halides', rx('alkyl halide|aryl halide|haloalkane|haloarene|halide|chloride|bromide|iodide|grignard')],
    ]],
    ['org_oxy','Organic: Alcohols, Phenols, Ethers',[
      ['ape','Alcohol / Phenol / Ether', rx('alcohol|phenol|\\bether\\b|\\bepoxide|glycol|\\b-ol\\b')],
    ]],
    ['org_carbonyl','Organic: Aldehydes, Ketones, Acids',[
      ['carbonyl','Carbonyl / Acid Derivatives', rx('aldehyde|ketone|carbonyl|carboxylic|\\bacid derivativ|ester|amide|anhydride|acyl|aldol|cannizzaro|\\bhvz\\b|\\b-al\\b|\\b-one\\b')],
    ]],
    ['org_amine','Organic: Amines & N-compounds',[
      ['amine','Amines / Nitrogen', rx('\\bamine|\\bamino(?!\\s*acid)|nitro compound|diazon|nitrile|cyanide|isocyanide|hofmann|hinsberg')],
    ]],
    ['org_biomol','Organic: Biomolecules',[
      ['biomol','Biomolecules', rx('biomolecul|bio.?molecul|carbohydrate|glucose|fructose|sucrose|protein|amino acid|nucleic|\\bdna\\b|\\brna\\b|enzyme|vitamin|hormone|lipid|nucleotide')],
    ]],
    ['org_polymer','Organic: Polymers',[
      ['polymer','Polymers', rx('polymer|polymeris|nylon|teflon|bakelite|rubber|monomer')],
    ]],
    ['org_practical','Organic: Practical (POC)',[
      ['poc','Purification / Analysis', rx('\\bpoc\\b|qualitative analysis|purification|kjeldahl|lassaigne|combustion analysis|empirical formula|distillation')],
    ]],
    ['org_eol','Organic: Chemistry in Everyday Life',[
      ['eol','Everyday Life', rx('\\bdrug\\b|medicin|antibiotic|antiseptic|detergent|\\bsoap\\b|food chemistry')],
    ]],
    ['org_gen','Organic: General / Mechanism',[
      ['mech','Reactions / Mechanism', rx('\\boc\\b|\\borganic|reaction mechanism|named reaction|\\bear\\b|\\beas\\b|reagent|conversion|reduction|oxidation of (?:alc|alde|alke)|\\brxn\\b')],
    ]],
    ['inorg_periodic','Inorganic: Periodic Table',[
      ['periodic','Periodicity', rx('periodic|periodicity|atomic radius|ionic radius|ionization energy|ionisation energy|electronegativ|electron affinity|effective nuclear|\\bzeff\\b|shielding|diagonal relation')],
    ]],
    ['inorg_bonding','Inorganic: Chemical Bonding',[
      ['bonding','Bonding & Structure', rx('chemical bond|\\bbonding|hybridi[sz]ation|\\bvsepr\\b|\\bvbt\\b|\\bmot\\b|molecular orbital|bond order|bond angle|dipole|hydrogen bond|lewis structure|resonance structure|fajan|lattice energy|\\bsigma bond|\\bpi bond|steric (?:no|number)')],
    ]],
    ['inorg_coord','Inorganic: Coordination Compounds',[
      ['coord','Coordination', rx('coordination|complex ion|ligand|\\bcft\\b|crystal field|werner|\\bcfse\\b|chelate|spectrochemical|\\bcomplex(?:es)?\\b')],
    ]],
    ['inorg_sblock','Inorganic: s-Block',[
      ['sblock','s-Block (alkali/alkaline)', rx('\\bs.?block|alkali metal|alkaline earth|sodium|potassium|calcium|magnesium|lithium|\\bbaking soda|washing soda')],
    ]],
    ['inorg_pblock','Inorganic: p-Block',[
      ['pblock','p-Block', rx('\\bp.?block|boron|carbon family|nitrogen family|oxygen family|halogen family|noble gas|interhalogen|\\bborax\\b|silicon|\\bgroup 1[3-8]\\b|allotrop|\\bxe(f|o)')],
    ]],
    ['inorg_dfblock','Inorganic: d & f Block',[
      ['dfblock','d & f Block', rx('\\bd.?block|\\bf.?block|transition (?:metal|element)|lanthan|actin|inner transition')],
    ]],
    ['inorg_metallurgy','Inorganic: Metallurgy',[
      ['metallurgy','Metallurgy', rx('metallurg|extraction of|\\bore\\b|smelting|roasting|calcination|froth flotation|ellingham|refining')],
    ]],
    ['inorg_salt','Inorganic: Qualitative Salt Analysis',[
      ['saltanalysis','Salt Analysis', rx('salt analysis|radical (?:test|analysis)|\\bcation test|\\banion test|\\bborax bead|brown ring|flame test')],
    ]],
    ['inorg_hydrogen','Inorganic: Hydrogen',[
      ['hydrogen','Hydrogen', rx('\\bhydrogen\\b|hydride|heavy water|hydrogen peroxide|\\bh2o2\\b')],
    ]],
    ['inorg_env','Inorganic: Environmental Chemistry',[
      ['env','Environmental', rx('environment|pollution|\\bozone|greenhouse|\\bsmog\\b|\\bbod\\b|\\bcod\\b')],
    ]],
    ['inorg_gen','Inorganic: General',[
      ['inorg_g','Inorganic (general)', rx('\\binorganic|\\bsalts?\\b|\\bionic\\b|\\boxide\\b|\\bhydroxide|\\bal\\(oh\\)|\\bal2o3|amphoteric')],
    ]],
    ['phy_mole','Physical: Mole Concept',[
      ['mole','Mole Concept / Stoichiometry', rx('mole concept|\\bmole\\b|stoichiom|equivalent (?:weight|concept|mass)|empirical|molarity|molality|\\bnormality|limiting reagent|atomic mass|molar mass|avogadro|\\bppm\\b|mass percent')],
    ]],
    ['phy_atomic','Physical: Atomic Structure',[
      ['atomic','Atomic Structure', rx('atomic structure|bohr|quantum number|orbital(?!\\s*molecular)|de broglie|heisenberg|schrodinger|hydrogen spectrum|rydberg|\\bazimuthal|\\bspin\\b|electronic config|aufbau|hund|pauli|photoelectric.*atom|wave f(?:unctio|x)n|wavefunction')],
    ]],
    ['phy_gas','Physical: States of Matter',[
      ['gas','Gaseous / Liquid State', rx('gas(?:eous)? (?:law|state|equation)|ideal gas|real gas|van der waal|\\bkinetic theory of gas|compressibility|critical temperature|vapour pressure|liquefaction')],
    ]],
    ['phy_thermo','Physical: Thermodynamics',[
      ['thermo','Thermodynamics / Thermochem', rx('thermodynam|thermochem|enthalp|entrop|gibbs|free energy|\\bhess|internal energy|\\bdelta ?[ghs]\\b|heat of|bond enthalpy|calorimet|\\bthermo\\b|first law|second law')],
    ]],
    ['phy_equil','Physical: Chemical Equilibrium',[
      ['chemequil','Chemical Equilibrium', rx('chemical equilibri|\\bkp\\b|\\bkc\\b|le chatelier|equilibrium constant|degree of dissociation|reaction quotient|\\beqbm\\b|\\bequilibrium\\b')],
    ]],
    ['phy_ionic','Physical: Ionic Equilibrium',[
      ['ionic_eq','Ionic Equilibrium', rx('ionic equilibri|\\bph\\b|\\bpoh\\b|buffer|hydrolysis|solubility product|\\bksp\\b|\\bka\\b|\\bkb\\b|acid.?base|titrat|equivalence point|indicator|henderson|common ion|degree of ionis')],
    ]],
    ['phy_redox','Physical: Redox Reactions',[
      ['redox','Redox', rx('redox|oxidation (?:number|state|no)|oxidising|reducing agent|balance.*redox|\\bn.?factor\\b|disproportion')],
    ]],
    ['phy_electro','Physical: Electrochemistry',[
      ['electrochem','Electrochemistry', rx('electrochem|electrolys|\\bemf\\b|nernst|galvanic|electrode potential|\\bcell\\b|conductanc|conductivity|kohlrausch|faraday|\\bsalt bridge|daniell|electrolytic')],
    ]],
    ['phy_kinetics','Physical: Chemical Kinetics',[
      ['kinetics','Chemical Kinetics', rx('kinetics|rate (?:law|constant|of reaction)|order of reaction|half life|arrhenius|activation energy|molecularity|\\bzero order|first order reaction|pseudo')],
    ]],
    ['phy_solutions','Physical: Solutions',[
      ['solutions','Solutions / Colligative', rx('colligative|raoult|osmotic|osmosis|elevation.*boiling|depression.*freezing|van.?t hoff|\\bsolution(?:s)?\\b|liquid solution|mole fraction')],
    ]],
    ['phy_solid','Physical: Solid State',[
      ['solid','Solid State', rx('solid state|crystal|unit cell|\\bbcc\\b|\\bfcc\\b|\\bhcp\\b|packing fraction|coordination number|bravais|schottky|frenkel|\\blattice\\b')],
    ]],
    ['phy_surface','Physical: Surface Chemistry',[
      ['surface','Surface Chemistry', rx('surface chem|adsorption|absorption|colloid|\\bsol\\b|emulsion|catalysis|catalyst|tyndall|freundlich|micelle')],
    ]],
    ['phy_nuclear','Physical: Nuclear Chemistry',[
      ['nuclear','Nuclear Chemistry', rx('nuclear chem|radioactiv|half.?life.*decay|carbon dating')],
    ]],
    ['chem_gen','Chemistry: General',[
      ['cg','General Chemistry', rx('\\bchemistry\\b|\\bchem\\b|reaction|\\bbond\\b|\\belement\\b')],
    ]],
  ],

  physics: [
    ['units','Units & Measurement',[
      ['units','Units / Dimensions / Error', rx('dimension|\\bunit(?:s)?\\b|measurement|error analysis|significant figure|least count|vernier|screw gauge|\\bpercentage error')],
    ]],
    ['kinematics','Kinematics',[
      ['kinematics','Kinematics / Projectile', rx('kinematic|projectile|\\bmotion in (?:a|one|two|1|2)|relative velocity|displacement.*velocity|\\bvelocity.?time|\\bv-t graph|equation of motion|free fall|river boat')],
    ]],
    ['nlm','Laws of Motion',[
      ['nlm','Newton Laws / Friction', rx('\\bnlm\\b|newton.?s? law|laws of motion|friction|\\btension\\b|\\bpulley|free body|\\bfbd\\b|inclined plane|\\bnormal force|constraint')],
    ]],
    ['wep','Work, Energy & Power',[
      ['wep','Work–Energy–Power', rx('\\bwork energy|work.?energy|\\bwork done|kinetic energy|potential energy|conservation of energy|\\bpower\\b|spring.*energy|work power energy|\\bwpe\\b')],
    ]],
    ['com','Centre of Mass & Collisions',[
      ['com','COM / Momentum / Collision', rx('centre of mass|center of mass|\\bcom\\b|collision|momentum|impulse|coefficient of restitution|\\bcor\\b|variable mass|rocket')],
    ]],
    ['rotation','Rotational Motion',[
      ['rotation','Rotational Motion', rx('rotation|moment of inertia|\\btorque|angular (?:momentum|velocity|acceleration)|rolling|\\brigid body|radius of gyration')],
    ]],
    ['gravitation','Gravitation',[
      ['gravitation','Gravitation', rx('gravitation|\\bgravity|kepler|orbital velocity|escape velocity|satellite|\\bgravitational')],
    ]],
    ['elasticity','Mechanical Properties of Solids',[
      ['elasticity','Elasticity', rx('elasticity|young.?s modulus|bulk modulus|\\bstress\\b|\\bstrain\\b|hooke|shear modulus|poisson')],
    ]],
    ['fluids','Mechanical Properties of Fluids',[
      ['fluids','Fluids', rx('fluid|hydrostatic|pascal|bernoulli|viscosity|surface tension|buoyan|archimedes|capillary|stokes|terminal velocity|\\bpressure\\b.*liquid|\\bflow\\b')],
    ]],
    ['heat','Thermal Physics & Heat',[
      ['heat','Heat / KTG / Thermo', rx('thermal|calorimet|specific heat|latent heat|\\bheat\\b|conduction|convection|radiation|\\bktg\\b|kinetic theory|\\bcarnot|heat engine|thermodynam|\\bthermo\\b|entrop|enthalp|\\bisotherm|\\badiabatic|\\bstefan|newton.?s law of cooling|\\btemperature\\b')],
    ]],
    ['shm','Oscillations (SHM)',[
      ['shm','SHM', rx('\\bshm\\b|simple harmonic|oscillation|pendulum|spring.*block|time period.*oscillat|angular frequency')],
    ]],
    ['waves','Waves & Sound',[
      ['waves','Waves / Sound', rx('\\bwave(?:s)?\\b|sound|doppler|beats|resonance|standing wave|stationary wave|organ pipe|\\bstring.*frequenc|wavelength|superposition')],
    ]],
    ['electrostatics','Electrostatics',[
      ['electrostatics','Electrostatics', rx('electrostat|coulomb|electric field|electric potential|\\bgauss|\\bflux\\b|dipole|charge.*charge|equipotential|\\bcharged (particle|plate|sphere)')],
    ]],
    ['capacitance','Capacitance',[
      ['capacitance','Capacitance', rx('capacit|\\bcapacitor|dielectric|parallel plate|\\bfarad')],
    ]],
    ['current','Current Electricity',[
      ['current','Current Electricity', rx('current electricity|\\bcurrent\\b|\\bohm|resistance|resistor|kirchh|\\bcircuit\\b|wheatstone|\\bemf.*cell|drift velocity|meter bridge|potentiometer|\\bresistivity')],
    ]],
    ['magnetism','Magnetism & Moving Charges',[
      ['magnetism','Magnetic Effects', rx('magnet|biot.?savart|ampere.?s law|moving charge|\\blorentz|cyclotron|solenoid|\\btoroid|magnetic (?:field|force|moment)|\\bbar magnet')],
    ]],
    ['emi','Electromagnetic Induction',[
      ['emi','EMI', rx('\\bemi\\b|electromagnetic induction|faraday.?s law|lenz|inductance|\\binductor|\\bemf.*induc|flux.*chang|eddy current|self induc|mutual induc')],
    ]],
    ['ac','Alternating Current',[
      ['ac','AC Circuits', rx('alternating current|\\bac circuit|\\blcr\\b|\\brms\\b|reactance|impedance|resonan.*circuit|power factor|transformer')],
    ]],
    ['emwaves','Electromagnetic Waves',[
      ['emwaves','EM Waves', rx('electromagnetic wave|\\bem wave|displacement current|maxwell|\\bspectrum.*electromag')],
    ]],
    ['rayoptics','Ray Optics',[
      ['rayoptics','Ray Optics', rx('ray optic|\\boptics\\b|\\blens\\b|\\bmirror\\b|refraction|reflection|\\bprism\\b|total internal|\\bsnell|focal length|\\bmagnification|optical instrument|microscope|telescope|\\bdispersion')],
    ]],
    ['waveoptics','Wave Optics',[
      ['waveoptics','Wave Optics', rx('wave optic|interference|diffraction|young.?s double|\\bydse\\b|polari[sz]ation|\\bfringe|coherent|huygens')],
    ]],
    ['modern','Modern Physics',[
      ['modern','Modern Physics', rx('photoelectric|\\bphoton|matter wave|dual nature|\\bnuclei\\b|nuclear (?:physics|reaction|fission|fusion)|radioactiv|\\bbohr|\\bx.?ray|binding energy|mass defect|work function|\\batom(?:ic)? model')],
    ]],
    ['semiconductor','Semiconductors',[
      ['semiconductor','Semiconductors / Electronics', rx('semiconductor|\\bdiode|transistor|\\bp.?n junction|logic gate|\\bzener|rectifier|\\bband gap|\\bdoping')],
    ]],
    ['communication','Communication Systems',[
      ['communication','Communication', rx('communication system|modulation|\\bam\\b.*\\bfm\\b|amplitude modulation|carrier wave')],
    ]],
    ['phy_exp','Experimental Physics',[
      ['exp','Experiments', rx('experiment|practical physics')],
    ]],
    ['phys_gen','Physics: General',[
      ['pg','General Physics', rx('\\bphysics\\b|\\bphy\\b|\\bmechanics\\b|\\bmotion\\b|circular motion|\\bforce\\b|\\benergy\\b|\\bvelocity|\\bacceleration')],
    ]],
  ],

  maths: [
    ['sets','Sets, Relations & Functions',[
      ['sets','Sets / Relations / Functions', rx('\\bsets?\\b|relation|\\bfunction(?:s)?\\b|domain|range|\\bonto\\b|\\binto\\b|bijection|injective|surjective|composite function|even.*odd function|inverse function|\\bfog\\b|\\bgof\\b')],
    ]],
    ['complex','Complex Numbers',[
      ['complex','Complex Numbers', rx('complex number|\\biota\\b|argand|modulus.*argument|\\bde moivre|conjugate|cube root of unity|\\barg\\b.*\\bz\\b')],
    ]],
    ['quadratic','Quadratic Equations',[
      ['quadratic','Quadratic / Theory of Eqns', rx('quadrat|location of root|nature of root|discriminant|sum.*product.*root|theory of equation|\\bcubic equation|common root')],
    ]],
    ['sequence','Sequences & Series',[
      ['sequence','Sequences & Series', rx('sequence|\\bseries\\b|\\bsns\\b|\\bgp\\b|\\bap\\b|\\bhp\\b|arithmetic progress|geometric progress|harmonic progress|\\bagp\\b|\\bam.?gm\\b|summation|sigma notation|telescop')],
    ]],
    ['pnc','Permutations & Combinations',[
      ['pnc','P & C', rx('\\bpnc\\b|\\bp n c\\b|permutation|combination|\\bncr\\b|\\bnpr\\b|arrangement|factorial|counting principle|circular permut|derangement|distribut.*identical')],
    ]],
    ['binomial','Binomial Theorem',[
      ['binomial','Binomial Theorem', rx('binomial|\\bgeneral term\\b|middle term|\\bncr.*expansion|coefficient of.*\\bx\\^|multinomial')],
    ]],
    ['matrices','Matrices',[
      ['matrices','Matrices', rx('matri(?:x|ces)|\\badjoint|\\bminor|cofactor|\\bsingular matrix|symmetric matrix|skew.?symmetric|elementary (?:row|operation)|\\binverse of.*matrix')],
    ]],
    ['determinants','Determinants',[
      ['determinants','Determinants', rx('determinant|cramer|\\bdelta\\b.*system|expansion.*determinant')],
    ]],
    ['mathreasoning','Mathematical Reasoning',[
      ['reasoning','Reasoning / Induction', rx('mathematical reasoning|\\btautology\\b|contrapositive|mathematical induction|\\bpmi\\b|truth table|logical connective')],
    ]],
    ['trig','Trigonometry',[
      ['trig','Trig Ratios & Equations', rx('trigonometr|\\btrigo?\\b|\\bsin\\b|\\bcos\\b|\\btan\\b|trigonometric (?:ratio|equation|identity)|compound angle|allied angle|\\bcosec|\\bsecant')],
    ]],
    ['itf','Inverse Trigonometry',[
      ['itf','Inverse Trig Functions', rx('inverse trig|\\bitf\\b|\\barcsin|\\barccos|\\barctan|sin\\s*inverse|\\bsin\\^?-1|cos\\^?-1|tan\\^?-1')],
    ]],
    ['triangle','Properties of Triangles',[
      ['triangle','Triangles / Heights', rx('properties of triangle|sine rule|cosine rule|\\bin.?radius|circumradius|height.*distance|solution of triangle|\\bnapier')],
    ]],
    ['straightlines','Straight Lines',[
      ['straightlines','Straight Lines', rx('straight line(?! pair)|\\bslope\\b|equation of line|\\bsection formula|distance formula|locus(?!.*pair)|\\bcollinear|family of line|foot of perpendicular')],
    ]],
    ['psl','Pair of Straight Lines',[
      ['psl','Pair of Straight Lines', rx('pair of straight line|pair of line|homogeneous equation.*line|angle between.*pair')],
    ]],
    ['circle','Circles',[
      ['circle','Circles', rx('\\bcircle(?:s)?\\b|\\btangent.*circle|chord of contact|radical axis|director circle|family of circle')],
    ]],
    ['conics','Conic Sections',[
      ['conics','Parabola / Ellipse / Hyperbola', rx('\\bconic|parabola|ellipse|hyperbola|eccentricity|directrix|\\bfocus\\b|latus rectum|asymptote')],
    ]],
    ['threed','3D Geometry',[
      ['threed','3D Geometry', rx('3d geometry|3.?d coordinate|direction cosine|direction ratio|equation of plane|line.*plane|skew line|\\bshortest distance.*line')],
    ]],
    ['vectors','Vectors',[
      ['vectors','Vectors', rx('\\bvector(?:s)?\\b|dot product|cross product|scalar product|scalar triple|\\bcoplanar|position vector|\\bunit vector')],
    ]],
    ['lcd','Limits, Continuity & Differentiability',[
      ['lcd','Limits / Continuity / Diff', rx('\\blimit(?:s)?\\b|\\blcd\\b|continuity|continuous|differentiab|\\bl.?hopital|lhopital|sandwich theorem|\\blhl\\b|\\brhl\\b')],
    ]],
    ['differentiation','Differentiation',[
      ['differentiation','Differentiation', rx('differentiat(?!ion equation)|\\bderivative\\b|chain rule|product rule|implicit diff|parametric diff|\\bdy/dx')],
    ]],
    ['aod','Application of Derivatives',[
      ['aod','AOD', rx('\\baod\\b|application of deriv|maxima|minima|\\bmonoton|increasing.*decreasing|tangent.*normal|rate of change|rolle|mean value theorem|\\blmvt\\b|approximation.*error')],
    ]],
    ['indefinite','Indefinite Integration',[
      ['indefinite','Indefinite Integration', rx('indefinite integ|integration by part|integration by substitut|partial fraction.*integ|\\bantideriv')],
    ]],
    ['definite','Definite Integration & Area',[
      ['definite','Definite Integration / Area', rx('definite integ|area under|area bounded|\\bproperties of definite|king.?s? rule|\\bnewton.?leibniz')],
    ]],
    ['integration','Integration (general)',[
      ['integration','Integration', rx('integrat|\\bintegral\\b|reduction formula')],
    ]],
    ['de','Differential Equations',[
      ['de','Differential Equations', rx('\\bde\\b|differential equation|order.*degree.*equation|variable separable|homogeneous diff|linear diff|integrating factor')],
    ]],
    ['probability','Probability',[
      ['probability','Probability', rx('probabilit|\\bbayes|conditional prob|binomial distrib|random variable|expectation|mutually exclusive|\\bodds\\b')],
    ]],
    ['statistics','Statistics',[
      ['statistics','Statistics', rx('statistic|\\bmean\\b|\\bmedian\\b|\\bmode\\b|variance|standard deviation|mean deviation')],
    ]],
    ['maths_gen','Maths: General',[
      ['mg','General Maths', rx('\\bmath|equation|\\bgraph\\b|\\bcalculus\\b|coordinate|geometry|\\bsum\\b')],
    ]],
  ],

  biology: [
    ['cell','Cell Biology',[
      ['cell','Cell Structure', rx('\\bcell\\b|organelle|mitochondria|nucleus|membrane|cytoplasm|cell cycle|mitosis|meiosis|chromosome')],
    ]],
    ['biomol_b','Biomolecules',[
      ['biomol','Biomolecules', rx('biomolecul|protein|carbohydrate|\\benzyme|nucleic|\\bdna\\b|\\brna\\b|amino acid|lipid')],
    ]],
    ['plant','Plant Physiology',[
      ['plant','Plant Physiology', rx('photosynthesis|plant|transpiration|respiration.*plant|mineral nutrition|\\bxylem|\\bphloem')],
    ]],
    ['human','Human Physiology',[
      ['human','Human Physiology', rx('human physiology|digestion|circulat|\\bheart\\b|\\bneuron|nervous|excret|\\bkidney|respiration|breathing|hormone|endocrine|locomotion|movement')],
    ]],
    ['genetics','Genetics & Evolution',[
      ['genetics','Genetics / Evolution', rx('genetic|heredity|mendel|evolution|natural selection|mutation|\\ballele|inheritance')],
    ]],
    ['reproduction','Reproduction',[
      ['reproduction','Reproduction', rx('reproduction|reproductive|gamet|fertilis|fertiliz|embryo|\\bzygote|pollination')],
    ]],
    ['ecology','Ecology',[
      ['ecology','Ecology', rx('ecolog|ecosystem|biodiversity|food chain|food web|population|biome')],
    ]],
    ['biotech','Biotechnology',[
      ['biotech','Biotechnology', rx('biotech|recombinant|\\bpcr\\b|cloning|genetic engineering|\\bplasmid')],
    ]],
    ['diversity','Diversity of Living Organisms',[
      ['diversity','Diversity / Classification', rx('classification|taxonomy|kingdom|\\bfungi|\\bbacteria|\\bvirus|\\balgae|monera|protista')],
    ]],
    ['bio_gen','Biology: General',[
      ['bg','General Biology', rx('\\bbio\\b|biology|\\borganism|\\bspecies')],
    ]],
  ],
};

function classifyText(s, text) {
  const chapters = TAX[s];
  const t = (text || '').toLowerCase().trim();
  if (!chapters || !t) return { ch:'uncat', chLabel:'Uncategorized', sub:'uncat', subLabel:'Uncategorized', conf:0 };
  for (const [chKey, chLabel, subs] of chapters) {
    for (const [subKey, subLabel, re] of subs) {
      if (re.test(t)) {
        const isGeneral = /_gen$|chem_gen/.test(chKey);
        return { ch: chKey, chLabel, sub: subKey, subLabel, conf: isGeneral ? 1 : 2 };
      }
    }
  }
  return { ch:'uncat', chLabel:'Uncategorized', sub:'uncat', subLabel:'Uncategorized', conf:0 };
}

// A strong title match wins; otherwise retry with title+body for more signal (helps short/vague titles).
function classify(subject, title, body) {
  const s = (subject || '').toLowerCase();
  const a = classifyText(s, title);
  if (a.conf === 2) return a;
  if (!body) return a;
  const b = classifyText(s, (title || '') + ' ' + body);
  return (b.ch !== 'uncat' && b.conf >= a.conf) ? b : a;
}

if (typeof module !== 'undefined') module.exports = { classify, classifyText, TAX };
