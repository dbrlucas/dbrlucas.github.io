// Projets affichés sur l'accueil et la page Projets, édités à la main ici.
// L'accueil met les deux premiers en avant (src/pages/index.astro) ; les plus récents d'abord.

export type Project = {
  title: string;
  desc: string;
  tags: string[];
  /** Plage de dates affichée, par exemple « Oct. 2026 – présent ». */
  periode: string;
  /** Lien facultatif (code, page du challenge…) ; absent quand il n'y a rien à partager publiquement. */
  lien?: { href: string; label: string };
};

export const projects: Project[] = [
  {
    title: "Création d'un Debugger Linux x64",
    desc: "Développement d'un debugger en C++ pour l'analyse dynamique d'exécutables ELF. L'objectif est d'implémenter le contrôle d'exécution, l'interception des appels système et l'injection de code via ptrace. Le projet met un accent sur la fiabilité logicielle avec une chaîne de build Meson, des tests via Catch2 et du fuzzing par mutation.",
    tags: ["C++", "ptrace", "Catch2", "Meson", "ELF", "Linux", "Reverse", "Fuzzing", "M2"],
    periode: "Nov. 2026 - Présent"
  },
  {
    title: "Attaques supply chain sur Kubernetes",
    desc: "Projet de recherche annuel de Master, en équipe de 4, encadré par une entreprise partenaire. L'objectif est de dresser un état de l'art des attaques de la supply chain logicielle et de la sécurisation de Kubernetes, puis de construire une plateforme (cluster, chaîne CI/CD, registre d'images) pour simuler ces attaques, les détecter et y répondre.",
    tags: ["Kubernetes", "Docker", "IaC", "Cloud", "Supply chain", "Détection", "M2"],
    periode: "Oct. 2026 - Présent"
  },
  {
    title: "Pentest d'un environnement Active Directory",
    desc: "Audit technique d'un domaine Active Directory simulé, en équipe de 2. L'objectif était d'évaluer le niveau d'exposition du SI et d'identifier les chemins de compromission. J'ai mené les phases de reconnaissance, d'exploitation (Kerberoasting, abus de GPO, élévation de privilèges) et de post-exploitation (DCSync, Golden Ticket). Le rapport final détaille les vulnérabilités identifiées et propose des recommandations basées sur les guides de l'ANSSI.",
    tags: ["Active Directory", "Kerberos", "BloodHound", "Impacket", "Windows", "Pentest", "M2"],
    periode: "Sept. - Oct. 2026"
  },
  {
    title: "Développement d'un Dynamic Loader ELF",
    desc: "Réécriture d'un chargeur de bibliothèques dynamiques (loader ELF) en C, sans utiliser la libdl. J'ai implémenté le parsing des en-têtes ELF, la gestion de la mémoire (mmap, support de l'ASLR/PIE), la résolution des relocations dynamiques (DT_RELA) et la gestion des permissions. J'ai également conçu un mécanisme de PLT (Procedure Linkage Table) personnalisé avec des trampolines en assembleur pour permettre l'appel de fonctions entre le programme hôte et la bibliothèque chargée.",
    tags: ["C", "ELF", "mmap", "PLT/GOT", "Assembleur", "CI/CD", "Linux", "Reverse", "M1"],
    periode: "Mars - Mai 2026" 
  },
  {
    title: "Organisation du CTF Cyber&Spice",
    desc: "Co-organisation d'un CTF en présentiel réunissant une centaine de participants. J'ai conçu des challenges forensic (image disque, exfiltration DNS, compromission par webshell), testé ceux des autres organisateurs, puis rédigé des solutions et des indices. J'ai aussi participé à la mise en place de l'infrastructure et à l'accompagnement des participants le jour de l'événement.",
    tags: ["Python", "Docker", "The Sleuth Kit", "Syslog", "Wireshark", "Forensic", "CTF", "M1"],
    periode: "Janv. - Mai 2026"
  },
  {
    title: "Reverse-engineering d'un verrou électronique",
    desc: "Projet d'analyse et de contournement d'un système de verrouillage sur carte STM32L152RE, en équipe de 2. J'ai extrait le firmware via OpenOCD et rétro-ingénieré le code ARM Cortex-M3 (Ghidra, GDB) pour identifier la fonction de vérification de la clé. L'analyse matérielle (sniffing I2C avec analyseur logique et Bus Pirate) m'a permis de comprendre le protocole de communication avec l'EEPROM de la clé. J'ai ensuite forgé et écrit une clé valide avec le Bus Pirate pour déverrouiller le système.",
    tags: ["STM32", "ARM", "Ghidra", "OpenOCD", "GDB", "I2C", "Bus Pirate", "Reverse", "Hardware", "M1"],
    periode: "Mars - Avr. 2026"
  },
  {
    title: "Attaque de protections anti-fingerprinting (Brave)",
    desc: "Projet de recherche sur le pistage web, en équipe de 2. J'ai développé un serveur de collecte d'empreintes de navigateur afin d'extraire diverses métriques (Canvas, WebGL, Audio, Fonts). J'ai ensuite implémenté en Python un algorithme d'association (linking) basé sur les travaux de recherche FP-Stalker. L'analyse a démontré qu'il est possible de lier des sessions de navigation et de contourner les protections (farbling) du navigateur Brave.",
    tags: ["Python", "Flask", "JavaScript", "SQLite", "Pandas", "Numpy", "Fingerprinting", "Privacy", "M1"],
    periode: "Mars - Avr. 2026"
  },
  {
    title: "Développement de fonctionnalités d'un noyau (Nachos)",
    desc: "Projet de système d'exploitation en C++ sur architecture RISC-V émulée, en équipe de 2. J'ai étendu le noyau pédagogique Nachos avec des mécanismes de synchronisation (sémaphores, verrous) et des appels système associés. J'ai également implémenté la gestion du changement de contexte entre processus, la mémoire virtuelle (chargement à la demande, traitement des défauts de page) et un algorithme de remplacement de page. Le système gère des espaces d'adressage séparés et des fichiers mappés.",
    tags: ["C++", "RISC-V", "Nachos", "Mémoire virtuelle", "Mmap", "Synchronisation", "OS", "M1"],
    periode: "Févr. - Avr. 2026"
  }
];
