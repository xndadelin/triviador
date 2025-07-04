export type Question = {
  question: string;
  options: string[];
  correctAnswer?: string;
  category?: string;
};

export const romaniaQuestions: Question[] = [
  {
    question: "What is the capital of Romania?",
    options: ["Bucharest", "Paris", "Berlin", "Madrid"],
    correctAnswer: "Bucharest",
    category: "geography"
  },
  {
    question: "Who wrote the novel \"Ion\"?",
    options: ["Liviu Rebreanu", "Mihail Sadoveanu", "Ion Creangă", "George Coșbuc"],
    correctAnswer: "Liviu Rebreanu",
    category: "literature"
  },
  {
    question: "In what year did Romania join the European Union?",
    options: ["2007", "2004", "2010", "2000"],
    correctAnswer: "2007",
    category: "history"
  },
  {
    question: "What is the largest river in Romania?",
    options: ["Danube", "Olt", "Mures", "Siret"],
    correctAnswer: "Danube",
    category: "geography"
  },
  {
    question: "Which mountain range runs through Romania?",
    options: ["Carpathians", "Alps", "Pyrenees", "Urals"],
    correctAnswer: "Carpathians",
    category: "geography"
  },
  {
    question: "What is the name of the Romanian currency?",
    options: ["Leu", "Euro", "Dollar", "Zloty"],
    correctAnswer: "Leu",
    category: "general"
  },
  {
    question: "Which of these is a traditional Romanian dish?",
    options: ["Sarmale", "Paella", "Sushi", "Hamburger"],
    correctAnswer: "Sarmale",
    category: "culture"
  },
  {
    question: "Who is considered the national poet of Romania?",
    options: ["Mihai Eminescu", "Ion Luca Caragiale", "Nichita Stănescu", "Tudor Arghezi"],
    correctAnswer: "Mihai Eminescu",
    category: "literature"
  },
  {
    question: "Which Romanian gymnast scored a perfect 10 at the 1976 Olympics?",
    options: ["Nadia Comăneci", "Simona Halep", "Gheorghe Hagi", "Ilie Năstase"],
    correctAnswer: "Nadia Comăneci",
    category: "sports"
  },
  {
    question: "What is the highest peak in Romania?",
    options: ["Moldoveanu Peak", "Negoiu Peak", "Omu Peak", "Retezat Peak"],
    correctAnswer: "Moldoveanu Peak",
    category: "geography"
  }
];

export const historyQuestions: Question[] = [
  {
    question: "Who was the first king of modern Romania?",
    options: ["Carol I", "Ferdinand I", "Michael I", "Charles II"],
    correctAnswer: "Carol I",
    category: "history"
  },
  {
    question: "In what year did the Romanian Revolution take place?",
    options: ["1989", "1991", "1986", "1979"],
    correctAnswer: "1989",
    category: "history"
  },
  {
    question: "Which Roman emperor led the conquest of Dacia (modern-day Romania)?",
    options: ["Trajan", "Augustus", "Constantine", "Nero"],
    correctAnswer: "Trajan",
    category: "history"
  },
  {
    question: "Who was Romania's communist leader from 1965 to 1989?",
    options: ["Nicolae Ceaușescu", "Ion Iliescu", "Gheorghe Gheorghiu-Dej", "Petru Groza"],
    correctAnswer: "Nicolae Ceaușescu",
    category: "history"
  },
  {
    question: "What was the ancient name of Romania?",
    options: ["Dacia", "Thracia", "Illyria", "Pannonia"],
    correctAnswer: "Dacia",
    category: "history"
  },
  {
    question: "Which medieval Romanian ruler is known for fighting against the Ottoman Empire?",
    options: ["Vlad the Impaler", "Stephen the Great", "Mircea the Elder", "Michael the Brave"],
    correctAnswer: "Vlad the Impaler",
    category: "history"
  },
  {
    question: "What event in 1918 led to the creation of Greater Romania?",
    options: ["The Great Union", "Treaty of Versailles", "Treaty of Trianon", "Transylvanian Revolution"],
    correctAnswer: "The Great Union",
    category: "history"
  }
];

export const geographyQuestions: Question[] = [
  {
    question: "Which sea borders Romania to the east?",
    options: ["Black Sea", "Mediterranean Sea", "Caspian Sea", "Adriatic Sea"],
    correctAnswer: "Black Sea",
    category: "geography"
  },
  {
    question: "Which of these countries does NOT share a border with Romania?",
    options: ["Poland", "Hungary", "Ukraine", "Bulgaria"],
    correctAnswer: "Poland",
    category: "geography"
  },
  {
    question: "What is the largest city in Transylvania?",
    options: ["Cluj-Napoca", "Brașov", "Sibiu", "Timișoara"],
    correctAnswer: "Cluj-Napoca",
    category: "geography"
  },
  {
    question: "Which region is known as the \"granary of Romania\"?",
    options: ["Bărăgan Plain", "Transylvania", "Dobrogea", "Banat"],
    correctAnswer: "Bărăgan Plain",
    category: "geography"
  },
  {
    question: "Which Romanian river flows into the Black Sea?",
    options: ["Danube", "Olt", "Mureș", "Siret"],
    correctAnswer: "Danube",
    category: "geography"
  },
  {
    question: "What is the second largest city in Romania?",
    options: ["Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
    correctAnswer: "Cluj-Napoca",
    category: "geography"
  },
  {
    question: "In which region of Romania is the Danube Delta located?",
    options: ["Dobrogea", "Moldova", "Muntenia", "Oltenia"],
    correctAnswer: "Dobrogea",
    category: "geography"
  }
];

export const cultureQuestions: Question[] = [
  {
    question: "Who composed the Romanian Rhapsody?",
    options: ["George Enescu", "Ciprian Porumbescu", "Dinu Lipatti", "Nicolae Breban"],
    correctAnswer: "George Enescu",
    category: "culture"
  },
  {
    question: "What is the traditional Romanian blouse called?",
    options: ["Ie", "Opinci", "Marama", "Suman"],
    correctAnswer: "Ie",
    category: "culture"
  },
  {
    question: "Which Romanian sculptor created \"The Endless Column\"?",
    options: ["Constantin Brâncuși", "Ion Jalea", "Corneliu Baba", "Nicolae Tonitza"],
    correctAnswer: "Constantin Brâncuși",
    category: "culture"
  },
  {
    question: "Which Romanian film won the Palme d'Or at Cannes Film Festival in 2007?",
    options: ["4 Months, 3 Weeks and 2 Days", "Child's Pose", "The Death of Mr. Lazarescu", "Beyond the Hills"],
    correctAnswer: "4 Months, 3 Weeks and 2 Days",
    category: "culture"
  },
  {
    question: "What is the name of the traditional Romanian dance where dancers form a circle?",
    options: ["Hora", "Samba", "Polka", "Waltz"],
    correctAnswer: "Hora",
    category: "culture"
  }
];

export const literatureQuestions: Question[] = [
  {
    question: "Which Romanian writer was a prominent member of the Theatre of the Absurd?",
    options: ["Eugen Ionesco", "Mircea Eliade", "Emil Cioran", "Lucian Blaga"],
    correctAnswer: "Eugen Ionesco",
    category: "literature"
  },
  {
    question: "Who wrote the novel \"The Forest of the Hanged\"?",
    options: ["Liviu Rebreanu", "Camil Petrescu", "Mihail Sadoveanu", "Marin Preda"],
    correctAnswer: "Liviu Rebreanu",
    category: "literature"
  },
  {
    question: "Which Romanian author wrote \"Nostalgia\"?",
    options: ["Mircea Cărtărescu", "Norman Manea", "Herta Müller", "Dan Lungu"],
    correctAnswer: "Mircea Cărtărescu",
    category: "literature"
  }
];

export const sportsQuestions: Question[] = [
  {
    question: "Which Romanian football team has won the European Cup (now Champions League)?",
    options: ["Steaua București", "Dinamo București", "Rapid București", "CFR Cluj"],
    correctAnswer: "Steaua București",
    category: "sports"
  },
  {
    question: "Which sport brought Romania the most Olympic gold medals?",
    options: ["Gymnastics", "Rowing", "Athletics", "Boxing"],
    correctAnswer: "Gymnastics",
    category: "sports"
  },
  {
    question: "Which Romanian tennis player won the Wimbledon Women's Singles title in 2019?",
    options: ["Simona Halep", "Sorana Cîrstea", "Monica Niculescu", "Irina-Camelia Begu"],
    correctAnswer: "Simona Halep",
    category: "sports"
  }
];

export const scienceQuestions: Question[] = [
  {
    question: "Who is the Romanian inventor of the jet engine?",
    options: ["Henri Coandă", "Petrache Poenaru", "Aurel Vlaicu", "Traian Vuia"],
    correctAnswer: "Henri Coandă",
    category: "science"
  },
  {
    question: "Which Romanian invented the first insulin extraction method?",
    options: ["Nicolae Paulescu", "Ana Aslan", "Victor Babeș", "Ioan Cantacuzino"],
    correctAnswer: "Nicolae Paulescu",
    category: "science"
  },
  {
    question: "What did Petrache Poenaru invent?",
    options: ["The fountain pen", "The telephone", "The lightbulb", "The automobile"],
    correctAnswer: "The fountain pen",
    category: "science"
  }
];

export const allQuestions: Question[] = [
  ...romaniaQuestions,
  ...historyQuestions,
  ...geographyQuestions,
  ...cultureQuestions,
  ...literatureQuestions,
  ...sportsQuestions,
  ...scienceQuestions
];

export function getRandomQuestions(count: number = 5, category?: string): Question[] {
  let questionPool = category 
    ? allQuestions.filter(q => q.category === category)
    : allQuestions;
  
  if (questionPool.length < count) {
    questionPool = allQuestions;
  }
  
  return shuffleArray(questionPool).slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomQuestion(category?: string): Question {
  const questions = getRandomQuestions(1, category);
  return questions[0];
}
