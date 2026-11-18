/* ============================================================================
   QUESTIONAIRE — exam-prep.js
   ----------------------------------------------------------------------------
   SAT, ACT, PSAT/NMSQT, GED and GRE practice banks.

   Each exam is one subject with 1,000 deterministic practice questions. The
   questions are built from tested item families (math, grammar, reading,
   science, social studies, vocabulary and argument analysis) so the page can
   ship a large bank without a multi-megabyte hand-maintained array. Every item
   has four distinct options, a rotating correct position, a hint and at least
   one explanation step.

   The generator is seeded, so question ids and content stay stable between
   reloads. Progress therefore keeps working across visits.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.STUDY_DATA;
  if (!DATA || !Array.isArray(DATA.categories)) return;

  const TARGET_PER_EXAM = 1000;
  const NAMES = ["Maya", "Jonah", "Priya", "Luis", "Nora", "Eli", "Amara", "Theo", "Sofia", "Ben"];
  const PLACES = ["the lab", "the library", "the studio", "the newsroom", "the workshop", "the archive"];

  /* --------------------------------------------------------------------------
     Small deterministic helpers
     -------------------------------------------------------------------------- */

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function () {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ri(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function pick(rng, array) {
    return array[Math.floor(rng() * array.length)];
  }

  function shuffle(rng, array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const next = x % y;
      x = y;
      y = next;
    }
    return x || 1;
  }

  function fraction(numerator, denominator) {
    const divisor = gcd(numerator, denominator);
    return numerator / divisor + "/" + denominator / divisor;
  }

  function money(value) {
    return "$" + (Math.round(value * 100) / 100).toFixed(2).replace(/\.00$/, "");
  }

  function uniqueWrongs(correct, wrongs) {
    const result = [];
    wrongs.forEach(function (wrong) {
      const text = String(wrong);
      if (text !== String(correct) && result.indexOf(text) < 0) result.push(text);
    });
    ["None of the above", "Cannot be determined", "Both A and B", "Not enough information"].forEach(function (fallback) {
      if (result.length < 3 && result.indexOf(fallback) < 0 && fallback !== String(correct)) result.push(fallback);
    });
    return result.slice(0, 3);
  }

  function placeOptions(correct, wrongs, target) {
    const distractors = uniqueWrongs(correct, wrongs);
    const options = [];
    let cursor = 0;
    for (let index = 0; index < 4; index += 1) {
      options.push(index === target ? String(correct) : distractors[cursor++]);
    }
    return { options: options, answer: target };
  }

  function baseQuestion(topic, prompt, correct, wrongs, hint, explanation, tags) {
    return {
      prompt: prompt,
      correct: String(correct),
      wrongs: wrongs,
      hint: hint,
      explanation: Array.isArray(explanation) ? explanation : [String(explanation)],
      tags: [topic].concat(tags || [])
    };
  }

  /* --------------------------------------------------------------------------
     Mathematics item families
     -------------------------------------------------------------------------- */

  function linear(rng) {
    const a = ri(rng, 2, 9);
    const x = ri(rng, 2, 18);
    const b = ri(rng, 1, 25);
    const c = a * x + b;
    return baseQuestion("Algebra", "Solve for x: " + a + "x + " + b + " = " + c + ".",
      x, [x + 1, x - 1, x + 2],
      "Subtract " + b + " from both sides, then divide by " + a + ".",
      ["Subtract " + b + ": " + a + "x = " + (c - b) + ".", "Divide by " + a + ": x = " + x + "."],
      ["linear equations", "isolating a variable"]);
  }

  function slope(rng) {
    const x1 = ri(rng, 1, 8);
    const dx = ri(rng, 2, 7);
    const m = ri(rng, 2, 6);
    const y1 = ri(rng, 1, 12);
    const x2 = x1 + dx;
    const y2 = y1 + m * dx;
    return baseQuestion("Algebra", "What is the slope of the line through (" + x1 + ", " + y1 + ") and (" + x2 + ", " + y2 + ")?",
      m, [-m, m + 1, fraction(1, m)],
      "Slope is the change in y divided by the change in x.",
      ["Change in y: " + y2 + " - " + y1 + " = " + (y2 - y1) + ".", "Change in x: " + x2 + " - " + x1 + " = " + dx + ". Slope = " + m + "."],
      ["slope", "coordinate geometry"]);
  }

  function system(rng) {
    const x = ri(rng, 3, 16);
    const y = ri(rng, 2, 12);
    return baseQuestion("Algebra", "If x + y = " + (x + y) + " and x - y = " + (x - y) + ", what is x?",
      x, [y, x + 1, x - 1],
      "Add the two equations to eliminate y.",
      ["Add: 2x = " + (x + y + x - y) + ".", "Divide by 2: x = " + x + "."],
      ["systems of equations", "elimination"]);
  }

  function inequality(rng) {
    const a = ri(rng, 2, 7);
    const x = ri(rng, 2, 12);
    const b = ri(rng, 1, 15);
    const c = a * x + b;
    return baseQuestion("Algebra", "Solve the inequality " + a + "x + " + b + " < " + c + ".",
      "x < " + x, ["x > " + x, "x < " + (x + 1), "x > " + (x - 1)],
      "Use the same inverse operations as an equation. Dividing by a positive number does not flip the sign.",
      ["Subtract " + b + ": " + a + "x < " + (c - b) + ".", "Divide by " + a + ": x < " + x + "."],
      ["inequalities", "algebra"]);
  }

  function absolute(rng) {
    const a = ri(rng, 2, 12);
    const b = ri(rng, 1, 6);
    return baseQuestion("Algebra", "What are the solutions to |x - " + a + "| = " + b + "?",
      "x = " + (a - b) + " or x = " + (a + b), ["x = " + a + " only", "x = " + (a + b) + " only", "x = " + (a - b) + " only"],
      "An absolute value equation splits into two cases: the expression equals b or -b.",
      ["x - " + a + " = " + b + " gives x = " + (a + b) + ".", "x - " + a + " = -" + b + " gives x = " + (a - b) + "."],
      ["absolute value", "equations"]);
  }

  function functionEval(rng) {
    const m = ri(rng, 2, 7);
    const b = ri(rng, -9, 9);
    const x = ri(rng, 2, 10);
    const sign = b >= 0 ? " + " : " - ";
    return baseQuestion("Algebra", "If f(x) = " + m + "x" + sign + Math.abs(b) + ", what is f(" + x + ")?",
      m * x + b, [m * x, m * x - b, m + x + b],
      "Substitute x into the function and follow the order of operations.",
      ["f(" + x + ") = " + m + "(" + x + ")" + sign + Math.abs(b) + ".", "That equals " + (m * x + b) + "."],
      ["functions", "substitution"]);
  }

  function exponentProduct(rng) {
    const base = ri(rng, 2, 6);
    const m = ri(rng, 2, 6);
    const n = ri(rng, 2, 6);
    return baseQuestion("Advanced Math", "Simplify " + base + "^" + m + " × " + base + "^" + n + ".",
      base + "^" + (m + n), [base + "^" + (m * n), base + "^" + Math.abs(m - n), (base * 2) + "^" + (m + n)],
      "When multiplying powers with the same base, add the exponents.",
      ["Keep the base: " + base + ".", "Add exponents: " + m + " + " + n + " = " + (m + n) + "."],
      ["exponents", "rules of exponents"]);
  }

  function sequence(rng) {
    const first = ri(rng, 2, 12);
    const difference = ri(rng, 3, 9);
    const n = ri(rng, 5, 14);
    return baseQuestion("Algebra", "An arithmetic sequence starts at " + first + " and increases by " + difference + " each term. What is term " + n + "?",
      first + (n - 1) * difference, [first + n * difference, first + (n - 1), difference * n],
      "Use a_n = a_1 + (n - 1)d.",
      ["a_" + n + " = " + first + " + (" + n + " - 1)(" + difference + ").", "That is " + first + " + " + ((n - 1) * difference) + " = " + (first + (n - 1) * difference) + "."],
      ["sequences", "arithmetic"]);
  }

  function proportion(rng) {
    const a = ri(rng, 2, 9);
    const b = ri(rng, 2, 9);
    const k = ri(rng, 2, 7);
    return baseQuestion("Algebra", "If " + a + "/" + b + " = x/" + (b * k) + ", what is x?",
      a * k, [a * b, a + k, b * k],
      "Cross-multiply, or notice that the denominator was multiplied by k.",
      ["Cross-multiply: " + a + "(" + (b * k) + ") = " + b + "x.", "Divide by " + b + ": x = " + (a * k) + "."],
      ["proportions", "ratios"]);
  }

  function costEquation(rng) {
    const rate = ri(rng, 12, 30);
    const fee = ri(rng, 5, 25);
    const hours = ri(rng, 2, 8);
    return baseQuestion("Algebra", "A repair company charges " + money(fee) + " plus " + money(rate) + " per hour. If the bill is " + money(fee + rate * hours) + ", how many hours did the job take?",
      hours, [hours + 1, hours - 1, Math.round((fee + rate * hours) / rate)],
      "Subtract the fixed fee, then divide by the hourly rate.",
      ["Subtract the fee: " + money(rate * hours) + ".", "Divide by " + money(rate) + ": " + hours + " hours."],
      ["linear models", "word problems"]);
  }

  function quadratic(rng) {
    const r1 = ri(rng, 1, 6);
    const r2 = ri(rng, 7, 12);
    return baseQuestion("Advanced Math", "The equation (x - " + r1 + ")(x - " + r2 + ") = 0 has which solutions?",
      "x = " + r1 + " or x = " + r2, ["x = -" + r1 + " or x = -" + r2, "x = " + (r1 + r2) + " only", "x = " + (r2 - r1) + " only"],
      "A product is zero when either factor is zero.",
      ["Set x - " + r1 + " = 0, so x = " + r1 + ".", "Set x - " + r2 + " = 0, so x = " + r2 + "."],
      ["quadratics", "factored form"]);
  }

  function vertex(rng) {
    const h = ri(rng, -6, 6);
    const k = ri(rng, -8, 8);
    const inner = h >= 0 ? "(x - " + h + ")" : "(x + " + Math.abs(h) + ")";
    const tail = k >= 0 ? " + " + k : " - " + Math.abs(k);
    return baseQuestion("Advanced Math", "What is the vertex of y = " + inner + "^2" + tail + "?",
      "(" + h + ", " + k + ")", ["(" + (-h) + ", " + k + ")", "(" + h + ", " + (-k) + ")", "(" + (-h) + ", " + (-k) + ")"],
      "Vertex form is y = (x - h)^2 + k, so the vertex is (h, k).",
      ["The expression is already in vertex form.", "Read h = " + h + " and k = " + k + "."],
      ["quadratics", "vertex form"]);
  }

  function discriminant(rng) {
    const a = ri(rng, 1, 4);
    const b = ri(rng, 2, 10);
    const c = ri(rng, 1, 5);
    const value = b * b - 4 * a * c;
    const answer = value > 0 ? "two distinct real solutions" : value === 0 ? "one repeated real solution" : "no real solutions";
    return baseQuestion("Advanced Math", "For " + a + "x^2 + " + b + "x + " + c + " = 0, the discriminant is " + value + ". What does that tell you?",
      answer, ["two distinct real solutions", "one repeated real solution", "no real solutions"],
      "The discriminant is b^2 - 4ac. Its sign determines the number of real roots.",
      ["A positive discriminant means two real roots.", "A zero discriminant means one repeated root.", "A negative discriminant means no real roots."],
      ["quadratics", "discriminant"]);
  }

  function composition(rng) {
    const m = ri(rng, 2, 5);
    const b = ri(rng, 1, 7);
    const c = ri(rng, 2, 6);
    const x = ri(rng, 1, 5);
    return baseQuestion("Advanced Math", "If f(x) = " + m + "x + " + b + " and g(x) = x + " + c + ", what is f(g(" + x + "))?",
      m * (x + c) + b, [m * x + b + c, m * x + c + b, m * (x + c)],
      "Work from the inside out: first find g(x), then put that result into f.",
      ["g(" + x + ") = " + (x + c) + ".", "f(" + (x + c) + ") = " + m + "(" + (x + c) + ") + " + b + " = " + (m * (x + c) + b) + "."],
      ["functions", "composition"]);
  }

  function exponentQuotient(rng) {
    const base = ri(rng, 2, 6);
    const m = ri(rng, 5, 10);
    const n = ri(rng, 2, 4);
    return baseQuestion("Advanced Math", "Simplify " + base + "^" + m + " ÷ " + base + "^" + n + ".",
      base + "^" + (m - n), [base + "^" + (m + n), base + "^" + (m * n), base + "^" + n],
      "When dividing powers with the same base, subtract the exponents.",
      ["Keep the base: " + base + ".", "Subtract: " + m + " - " + n + " = " + (m - n) + "."],
      ["exponents", "division"]);
  }

  function percentDiscount(rng) {
    const price = ri(rng, 4, 20) * 10;
    const discount = pick(rng, [10, 15, 20, 25, 30]);
    const answer = price * (1 - discount / 100);
    return baseQuestion("Problem Solving & Data", "A " + money(price) + " item is discounted by " + discount + "%. What is the sale price?",
      money(answer), [money(price - discount), money(price * (1 + discount / 100)), money(price * discount / 100)],
      "Pay the complement of the discount: 100% minus the discount percent.",
      ["The customer pays " + (100 - discount) + "% of the price.", money(price) + " × 0." + String(100 - discount).padStart(2, "0") + " = " + money(answer) + "."],
      ["percentages", "discount"]);
  }

  function percentIncrease(rng) {
    const value = ri(rng, 2, 20) * 10;
    const change = pick(rng, [10, 20, 25, 50]);
    const answer = value * (1 + change / 100);
    return baseQuestion("Problem Solving & Data", "A value of " + value + " increases by " + change + "%. What is the new value?",
      answer, [value + change, value * (1 - change / 100), value * change / 100],
      "Multiply by 1 plus the decimal form of the percent increase.",
      ["The multiplier is 1 + 0." + String(change).padStart(2, "0") + ".", value + " × " + (1 + change / 100) + " = " + answer + "."],
      ["percentages", "growth"]);
  }

  function ratio(rng) {
    const a = ri(rng, 2, 5);
    const b = ri(rng, 2, 5);
    const total = (a + b) * ri(rng, 3, 10);
    return baseQuestion("Problem Solving & Data", "A " + total + "-item order is split in the ratio " + a + ":" + b + ". What is the larger share?",
      Math.max((total * a) / (a + b), (total * b) / (a + b)), [(total * a) / (a + b), (total * b) / (a + b), total / 2],
      "Add the ratio parts, then give each part its fraction of the total.",
      ["Total parts: " + (a + b) + ".", "Each part is " + (total / (a + b)) + " items; the larger share is " + Math.max((total * a) / (a + b), (total * b) / (a + b)) + "."],
      ["ratios", "proportions"]);
  }

  function mean(rng) {
    const values = [];
    let sum = 0;
    for (let i = 0; i < 4; i += 1) {
      const value = ri(rng, 2, 20);
      values.push(value);
      sum += value;
    }
    const last = ri(rng, 2, 20);
    values.push(last);
    sum += last;
    const target = Math.round(sum / 5);
    const adjustedLast = target * 5 - (sum - last);
    values[4] = adjustedLast;
    const total = values.reduce(function (a, b) { return a + b; }, 0);
    return baseQuestion("Problem Solving & Data", "What is the mean of " + values.join(", ") + "?",
      total / 5, [total / 4, total / 5 + 1, Math.max.apply(null, values)],
      "Add the values and divide by how many there are.",
      ["Sum = " + total + ".", "There are 5 values, so the mean is " + (total / 5) + "."],
      ["statistics", "mean"]);
  }

  function median(rng) {
    const values = [];
    for (let i = 0; i < 5; i += 1) values.push(ri(rng, 1, 30));
    values.sort(function (a, b) { return a - b; });
    return baseQuestion("Problem Solving & Data", "What is the median of " + values.join(", ") + "?",
      values[2], [values[1], values[3], (values[0] + values[4]) / 2],
      "Sort the values and take the middle one.",
      ["The sorted list is " + values.join(", ") + ".", "The middle value is " + values[2] + "."],
      ["statistics", "median"]);
  }

  function range(rng) {
    const values = [];
    for (let i = 0; i < 6; i += 1) values.push(ri(rng, 1, 40));
    const high = Math.max.apply(null, values);
    const low = Math.min.apply(null, values);
    return baseQuestion("Problem Solving & Data", "What is the range of " + values.join(", ") + "?",
      high - low, [high, low, high + low],
      "Range is the largest value minus the smallest value.",
      ["Largest = " + high + ", smallest = " + low + ".", "Range = " + high + " - " + low + " = " + (high - low) + "."],
      ["statistics", "range"]);
  }

  function probability(rng) {
    const red = ri(rng, 2, 7);
    const blue = ri(rng, 2, 8);
    return baseQuestion("Problem Solving & Data", "A bag has " + red + " red and " + blue + " blue marbles. What is the probability of drawing red?",
      fraction(red, red + blue), [fraction(blue, red + blue), fraction(red, blue), fraction(red + blue, red)],
      "Probability is favorable outcomes divided by total outcomes.",
      ["Favorable = " + red + ". Total = " + (red + blue) + ".", "The probability is " + fraction(red, red + blue) + "."],
      ["probability", "fractions"]);
  }

  function tableDifference(rng) {
    const a = ri(rng, 20, 60);
    const b = a + ri(rng, 5, 25);
    return baseQuestion("Problem Solving & Data", "A survey reports " + a + " responses in Year 1 and " + b + " in Year 2. What is the percent increase?",
      Math.round(((b - a) / a) * 100) + "%", [Math.round((b - a) * 100) + "%", Math.round((b / a) * 100) + "%", b - a + " responses"],
      "Percent change = (new - old) / old × 100.",
      ["Change = " + (b - a) + ".", "Divide by " + a + " and multiply by 100: about " + Math.round(((b - a) / a) * 100) + "%."],
      ["data interpretation", "percent change"]);
  }

  function unitRate(rng) {
    const count = ri(rng, 3, 9);
    const price = count * ri(rng, 2, 8);
    return baseQuestion("Problem Solving & Data", count + " notebooks cost " + money(price) + ". What is the cost per notebook?",
      money(price / count), [money(price * count), money(price - count), money(price / (count + 1))],
      "Divide the total cost by the number of items.",
      ["Total cost " + money(price) + " ÷ " + count + " items.", "Each notebook costs " + money(price / count) + "."],
      ["unit rate", "division"]);
  }

  function scaleMap(rng) {
    const miles = ri(rng, 2, 8) * 5;
    const inches = ri(rng, 2, 6);
    return baseQuestion("Problem Solving & Data", "A map uses 1 inch to represent " + miles + " miles. How far is " + inches + " inches?",
      miles * inches + " miles", [miles + inches + " miles", miles * inches + " inches", miles / inches + " miles"],
      "Multiply the number of inches by the scale.",
      ["Each inch is " + miles + " miles.", inches + " × " + miles + " = " + (miles * inches) + " miles."],
      ["scale", "proportions"]);
  }

  function averageSpeed(rng) {
    const speed = ri(rng, 20, 60);
    const hours = ri(rng, 2, 6);
    return baseQuestion("Problem Solving & Data", "A cyclist travels at " + speed + " km/h for " + hours + " hours. How far does the cyclist travel?",
      speed * hours + " km", [speed + hours + " km", speed / hours + " km", (speed * hours) / 2 + " km"],
      "Distance = rate × time.",
      ["Distance = " + speed + " × " + hours + ".", "That is " + (speed * hours) + " km."],
      ["rate", "distance"]);
  }

  function rectangle(rng) {
    const width = ri(rng, 3, 12);
    const height = ri(rng, 4, 15);
    return baseQuestion("Geometry & Trigonometry", "A rectangle is " + width + " cm by " + height + " cm. What is its area?",
      width * height + " cm²", [2 * (width + height) + " cm²", width + height + " cm²", width * height + " cm"],
      "Area of a rectangle is length × width.",
      ["Area = " + width + " × " + height + ".", "The area is " + (width * height) + " cm²."],
      ["geometry", "area"]);
  }

  function triangleAngles(rng) {
    const a = ri(rng, 30, 80);
    const b = ri(rng, 30, 80);
    return baseQuestion("Geometry & Trigonometry", "Two angles of a triangle measure " + a + "° and " + b + "°. What is the third angle?",
      180 - a - b + "°", [a + b + "°", 90 - a + "°", 360 - a - b + "°"],
      "The angles in a triangle add to 180°.",
      ["Known sum = " + (a + b) + "°.", "Third angle = 180° - " + (a + b) + "° = " + (180 - a - b) + "°."],
      ["geometry", "triangles"]);
  }

  function circle(rng) {
    const radius = ri(rng, 2, 12);
    return baseQuestion("Geometry & Trigonometry", "Which expression gives the circumference of a circle with radius " + radius + "?",
      "2π(" + radius + ")", ["π(" + radius + ")^2", "π(" + radius + ")", "2π(" + radius + ")^2"],
      "Circumference is 2πr; area is πr².",
      ["The formula is C = 2πr.", "Substitute r = " + radius + " to get 2π(" + radius + ")."],
      ["geometry", "circles"]);
  }

  function pythagorean(rng) {
    const k = ri(rng, 1, 5);
    const a = 3 * k;
    const b = 4 * k;
    return baseQuestion("Geometry & Trigonometry", "A right triangle has legs " + a + " and " + b + ". What is the hypotenuse?",
      5 * k, [a + b, 7 * k, Math.sqrt(a * a + b * b) + 1],
      "Use a² + b² = c².",
      [a + "² + " + b + "² = " + (a * a + b * b) + ".", "The square root is " + (5 * k) + "."],
      ["geometry", "Pythagorean theorem"]);
  }

  function midpoint(rng) {
    const x1 = ri(rng, -8, 8);
    const y1 = ri(rng, -8, 8);
    const x2 = ri(rng, -8, 8);
    const y2 = ri(rng, -8, 8);
    return baseQuestion("Geometry & Trigonometry", "What is the midpoint of (" + x1 + ", " + y1 + ") and (" + x2 + ", " + y2 + ")?",
      "(" + ((x1 + x2) / 2) + ", " + ((y1 + y2) / 2) + ")", ["(" + (x1 + x2) + ", " + (y1 + y2) + ")", "(" + ((x1 - x2) / 2) + ", " + ((y1 - y2) / 2) + ")", "(" + x1 + ", " + y2 + ")"],
      "Average the x-coordinates and average the y-coordinates.",
      ["x midpoint = (" + x1 + " + " + x2 + ")/2 = " + ((x1 + x2) / 2) + ".", "y midpoint = (" + y1 + " + " + y2 + ")/2 = " + ((y1 + y2) / 2) + "."],
      ["geometry", "midpoint"]);
  }

  function distance(rng) {
    const x1 = ri(rng, -5, 5);
    const y1 = ri(rng, -5, 5);
    const x2 = x1 + ri(rng, 3, 9);
    const y2 = y1;
    return baseQuestion("Geometry & Trigonometry", "What is the distance between (" + x1 + ", " + y1 + ") and (" + x2 + ", " + y2 + ")?",
      x2 - x1, [x1 + x2, y2 - y1 + 1, Math.abs(x1 - x2) + 1],
      "The points have the same y-coordinate, so the distance is the horizontal change.",
      ["Distance = |" + x2 + " - " + x1 + "|.", "That is " + (x2 - x1) + "."],
      ["geometry", "distance"]);
  }

  function volume(rng) {
    const l = ri(rng, 2, 8);
    const w = ri(rng, 2, 8);
    const h = ri(rng, 2, 8);
    return baseQuestion("Geometry & Trigonometry", "What is the volume of a box with dimensions " + l + " × " + w + " × " + h + "?",
      l * w * h, [l + w + h, 2 * (l * w + l * h + w * h), l * w + h],
      "Volume of a rectangular box is length × width × height.",
      ["Multiply the three dimensions.", l + " × " + w + " × " + h + " = " + (l * w * h) + "."],
      ["geometry", "volume"]);
  }

  function trigRatio(rng) {
    const opposite = ri(rng, 3, 9);
    const adjacent = ri(rng, 3, 9);
    const hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
    return baseQuestion("Geometry & Trigonometry", "In a right triangle, the side opposite angle θ is " + opposite + " and the hypotenuse is " + hypotenuse.toFixed(1) + ". Which ratio is sin θ?",
      opposite + "/" + hypotenuse.toFixed(1), [adjacent + "/" + hypotenuse.toFixed(1), opposite + "/" + adjacent, adjacent + "/" + opposite],
      "sin θ = opposite / hypotenuse.",
      ["Use the side opposite θ over the hypotenuse.", "That is " + opposite + "/" + hypotenuse.toFixed(1) + "."],
      ["trigonometry", "sine"]);
  }

  function areaTriangle(rng) {
    const base = ri(rng, 4, 14);
    const height = ri(rng, 3, 12);
    return baseQuestion("Geometry & Trigonometry", "A triangle has base " + base + " and height " + height + ". What is its area?",
      (base * height) / 2, [base * height, base + height, (base * height) / 3],
      "Area of a triangle is ½ × base × height.",
      ["Multiply base and height: " + (base * height) + ".", "Half of that is " + ((base * height) / 2) + "."],
      ["geometry", "area"]);
  }

  /* --------------------------------------------------------------------------
     Grammar and writing item families
     -------------------------------------------------------------------------- */

  function subjectVerb(rng) {
    const name = pick(rng, NAMES);
    const singular = rng() > 0.5;
    const subject = singular ? "The list of " + pick(rng, ["supplies", "names", "books", "tools"]) : "The students in " + pick(rng, PLACES);
    const correct = singular ? "is" : "are";
    return baseQuestion("Reading & Writing", "Choose the correct verb: \"" + subject + " ___ ready for " + name + ".\"",
      correct, [singular ? "are" : "is", "were", "be"],
      "Find the grammatical subject, not the noun nearest the blank.",
      ["The subject is \"" + subject + "\".", singular ? "A singular subject takes \"is\"." : "A plural subject takes \"are\"."],
      ["subject-verb agreement", "grammar"]);
  }

  function pronounCase(rng) {
    const name = pick(rng, NAMES);
    return baseQuestion("Reading & Writing", "Choose the correct pronoun: \"Between you and ___, " + name + " made the final call.\"",
      "me", ["I", "myself", "mine"],
      "A pronoun after a preposition takes the object form.",
      ["\"Between\" is a preposition.", "The object form is \"me\"."],
      ["pronouns", "case"]);
  }

  function apostrophe(rng) {
    const noun = pick(rng, ["book", "student", "teacher", "artist"]);
    return baseQuestion("Reading & Writing", "Choose the correct possessive: \"The ___ cover was torn.\"",
      noun + "'s", [noun + "s", noun + "s'", noun + "s's"],
      "A singular noun takes an apostrophe before the s.",
      ["The cover belongs to one " + noun + ".", "Write " + noun + "'s."],
      ["apostrophes", "possessives"]);
  }

  function semicolon(rng) {
    const name = pick(rng, NAMES);
    return baseQuestion("Reading & Writing", "Which punctuation correctly joins these independent clauses? \"The first trial failed ___ " + name + " revised the method.\"",
      "; therefore,", [", therefore,", " therefore,", "; therefore"],
      "Use a semicolon before a conjunctive adverb that joins two independent clauses, and a comma after it.",
      ["The clauses are independent, so a comma alone is a splice.", "The pattern is \"; therefore,\"."],
      ["semicolons", "conjunctive adverbs"]);
  }

  function colon(rng) {
    return baseQuestion("Reading & Writing", "Which punctuation correctly introduces the list? \"She packed three things ___ a notebook, a pen, and a ruler.\"",
      ":", [";", ",", "and"],
      "A colon introduces a list after a complete clause.",
      ["The clause before the list is complete.", "Use a colon, not a semicolon, to introduce the list."],
      ["colons", "lists"]);
  }

  function modifier(rng) {
    const name = pick(rng, NAMES);
    return baseQuestion("Reading & Writing", "Which ending avoids a dangling modifier? \"Walking to the station, ___\"",
      name + " noticed the dark clouds.", ["the rain began to fall on " + name + ".", "the train was missed by " + name + ".", name + "'s umbrella was left at home."],
      "The opening phrase must describe the subject of the main clause.",
      ["The person walking is " + name + ".", "The main clause should begin with " + name + "."],
      ["modifiers", "sentence structure"]);
  }

  function parallel(rng) {
    return baseQuestion("Reading & Writing", "Choose the item that completes the parallel list: \"The course teaches drafting, revising, and ___.\"",
      "editing", ["to edit", "edition", "edit"],
      "Items in a list should share the same grammatical form.",
      ["Drafting and revising are gerunds.", "Use the gerund \"editing\"."],
      ["parallel structure", "writing"]);
  }

  function tense(rng) {
    const name = pick(rng, NAMES);
    return baseQuestion("Reading & Writing", "Choose the correct tense: \"By the time the results arrived, " + name + " ___ the report.\"",
      "had finished", ["has finished", "finishes", "finish"],
      "The earlier of two past actions takes the past perfect.",
      ["The finishing happened before the results arrived.", "Use \"had finished\"."],
      ["verb tense", "past perfect"]);
  }

  function transition(rng) {
    const pairs = [
      ["The first trial produced no effect. ___, the second trial used a higher dose.", "Therefore"],
      ["The first trial produced no effect. ___, the second trial produced a clear change.", "By contrast"],
      ["The method is inexpensive. ___, it requires little training.", "In addition"],
      ["The data were incomplete. ___, the team delayed the conclusion.", "As a result"]
    ];
    const pair = pick(rng, pairs);
    return baseQuestion("Reading & Writing", "Choose the best transition: \"" + pair[0] + "\"",
      pair[1], ["However", "For example", "Similarly"],
      "Choose the transition that matches the logical relationship between the sentences.",
      ["Read the two sentences as a cause, contrast, addition or example.", "The best fit is \"" + pair[1] + "\"."],
      ["transitions", "logic"]);
  }

  function concision(rng) {
    return baseQuestion("Reading & Writing", "Which sentence is the most concise?",
      "The team met to discuss the budget.", ["The team met in order to discuss the budget.", "The team met for the purpose of discussing the budget.", "The team held a meeting for the discussion of the budget."],
      "Prefer the shortest version that keeps the meaning.",
      ["\"To discuss\" already expresses purpose.", "The other options add empty words."],
      ["concision", "editing"]);
  }

  function whoWhom(rng) {
    const name = pick(rng, NAMES);
    return baseQuestion("Reading & Writing", "Choose the correct pronoun: \"The scientist ___ discovered the enzyme thanked " + name + ".\"",
      "who", ["whom", "which", "whose"],
      "Use \"who\" for the subject of the verb that follows.",
      ["The scientist is the subject of \"discovered\".", "Use \"who\"."],
      ["pronouns", "who/whom"]);
  }

  function itsItS(rng) {
    return baseQuestion("Reading & Writing", "Choose the correct form: \"The company revised ___ policy.\"",
      "its", ["it's", "its'", "it"],
      "\"Its\" is possessive; \"it's\" means \"it is\".",
      ["The policy belongs to the company.", "Use the possessive \"its\"."],
      ["apostrophes", "possessives"]);
  }

  function fewerLess(rng) {
    const noun = pick(rng, ["applicants", "errors", "seats", "complaints"]);
    return baseQuestion("Reading & Writing", "Choose the correct word: \"There were ___ " + noun + " this year than last.\"",
      "fewer", ["less", "lesser", "few"],
      "Use \"fewer\" with countable nouns and \"less\" with uncountable quantities.",
      [noun + " are countable.", "Use \"fewer\"."],
      ["usage", "fewer/less"]);
  }

  function betweenAmong(rng) {
    const winners = ri(rng, 4, 7);
    return baseQuestion("Reading & Writing", "Choose the correct word: \"The prize was divided ___ the " + winners + " winners.\"",
      "among", ["between", "within", "through"],
      "Use \"among\" for a group of three or more.",
      ["There are " + winners + " winners.", "Use \"among\"."],
      ["usage", "between/among"]);
  }

  function comparative(rng) {
    return baseQuestion("Reading & Writing", "Choose the correct comparative: \"This route is ___ than the old one.\"",
      "more efficient", ["efficienter", "most efficient", "more efficiently"],
      "Use \"more\" with multi-syllable adjectives.",
      ["\"Efficient\" has three syllables.", "The comparative is \"more efficient\"."],
      ["comparatives", "adjectives"]);
  }

  function fragment(rng) {
    return baseQuestion("Reading & Writing", "Which option is a complete sentence?",
      "The team revised the report.", ["Because the team revised the report.", "Revising the report late at night.", "The report, which the team revised."],
      "A complete sentence needs a subject and a finite verb.",
      ["Only one option has an independent clause.", "\"The team revised the report\" stands alone."],
      ["sentence fragments", "grammar"]);
  }

  function runOn(rng) {
    return baseQuestion("Reading & Writing", "Which sentence is correctly punctuated?",
      "The rain stopped; we continued the hike.", ["The rain stopped, we continued the hike.", "The rain stopped we continued the hike.", "The rain stopped, and we continued, the hike."],
      "Two independent clauses need a semicolon, a period or a coordinating conjunction.",
      ["A comma alone creates a splice.", "The semicolon version is correct."],
      ["run-ons", "punctuation"]);
  }

  function activeVoice(rng) {
    return baseQuestion("Reading & Writing", "Which sentence uses the active voice?",
      "The committee approved the plan.", ["The plan was approved by the committee.", "The plan had been approved.", "The plan is being approved."],
      "In the active voice, the subject performs the action.",
      ["\"The committee\" performs \"approved\".", "The other options put the plan first and use a form of \"be\"."],
      ["active voice", "style"]);
  }

  function commaList(rng) {
    return baseQuestion("Reading & Writing", "Which sentence uses commas correctly?",
      "She bought apples, pears, and figs.", ["She bought apples pears and figs.", "She bought, apples, pears, and figs.", "She bought apples, pears and, figs."],
      "Separate items in a series with commas; do not put a comma between the verb and its object.",
      ["The list has three items.", "Commas belong between the items."],
      ["commas", "lists"]);
  }

  function apostrophePlural(rng) {
    return baseQuestion("Reading & Writing", "Choose the correct possessive: \"The ___ coats hung by the door.\"",
      "children's", ["childrens", "childrens'", "children"],
      "Irregular plurals form the possessive with an apostrophe before the s.",
      ["The plural is \"children\".", "The possessive is \"children's\"."],
      ["apostrophes", "irregular plurals"]);
  }

  function subjectPronoun(rng) {
    return baseQuestion("Reading & Writing", "Choose the correct pronoun: \"The manager and ___ reviewed the plan.\"",
      "I", ["me", "myself", "mine"],
      "Use the subject form when the pronoun is part of the subject.",
      ["The pronoun is doing the reviewing.", "Use \"I\"."],
      ["pronouns", "case"]);
  }

  function danglingInfinitive(rng) {
    const name = pick(rng, NAMES);
    return baseQuestion("Reading & Writing", "Which ending avoids a dangling modifier? \"To improve the essay, ___\"",
      name + " revised the introduction.", ["the introduction was revised.", "the essay needed revision.", "revisions were made."],
      "The subject after the comma must be the person doing the improving.",
      ["The opener describes " + name + "'s action.", "Begin the main clause with " + name + "."],
      ["modifiers", "writing"]);
  }

  function dash(rng) {
    return baseQuestion("Reading & Writing", "Which sentence uses a dash correctly?",
      "The result — a clear improvement — surprised everyone.", ["The result, a clear improvement, surprised — everyone.", "The result — a clear improvement, surprised everyone.", "The result a clear improvement — surprised everyone."],
      "A pair of dashes can set off an interrupting phrase.",
      ["The phrase \"a clear improvement\" interrupts the sentence.", "Both dashes must close the interruption."],
      ["dashes", "punctuation"]);
  }

  function quotation(rng) {
    return baseQuestion("Reading & Writing", "Which sentence punctuates the quotation correctly?",
      "Maya said, \"The results are ready.\"", ["Maya said \"The results are ready\".", "Maya said, \"The results are ready\".", "Maya said, The results are ready."],
      "Use a comma before a quoted sentence and keep end punctuation inside the quotation marks in American style.",
      ["The quotation is a complete sentence.", "The period goes inside the closing quotation mark."],
      ["quotation marks", "punctuation"]);
  }

  /* --------------------------------------------------------------------------
     Reading passages
     -------------------------------------------------------------------------- */

  const PASSAGES = [
    {
      text: "City trees do more than soften a streetscape. Their leaves shade asphalt, lowering surface temperatures, while their roots help rainfall soak into soil instead of racing into storm drains. A neighbourhood with mature trees can be several degrees cooler on a summer afternoon. The benefit is not evenly distributed: wealthier districts often have denser canopy, while hotter, lower-income areas may have few trees and more pavement.",
      main: "Urban trees provide measurable cooling and stormwater benefits, but canopy coverage is unequal.",
      detail: "Tree roots help rainfall soak into soil rather than running directly into storm drains.",
      inference: "Planting trees in hotter, lower-income neighbourhoods could reduce heat exposure.",
      word: "canopy",
      wordMeaning: "the layer of leaves and branches that shades the ground",
      purpose: "to explain an environmental benefit and note an equity gap",
      tone: "informative and concerned",
      evidence: "wealthier districts often have denser canopy",
      structure: "benefits first, then a qualification"
    },
    {
      text: "Bioluminescence is common in the deep ocean, where sunlight cannot reach. Many animals produce light through a chemical reaction involving luciferin and oxygen. Some use the glow to attract prey; others flash to startle predators or to signal a mate. Because the deep sea is vast and difficult to study, researchers still know relatively little about how these signals are used in everyday survival.",
      main: "Deep-sea animals use bioluminescence for several survival functions, though much remains unknown.",
      detail: "Bioluminescence results from a chemical reaction involving luciferin and oxygen.",
      inference: "Observing deep-sea animals in their natural habitat is technically difficult.",
      word: "startle",
      wordMeaning: "to surprise suddenly in a way that causes a reaction",
      purpose: "to describe a biological phenomenon and its functions",
      tone: "curious and scientific",
      evidence: "the deep sea is vast and difficult to study",
      structure: "definition, examples, then a limitation"
    },
    {
      text: "Public libraries have expanded their role from lending printed books to lending digital media, tools and even museum passes. This shift has broadened access for people who cannot easily travel or afford subscriptions. At the same time, libraries must balance limited budgets against rising licensing costs for e-books, which are often more expensive per loan than physical copies.",
      main: "Libraries now lend far more than books, but digital licensing creates budget pressure.",
      detail: "E-books can cost libraries more per loan than physical copies.",
      inference: "A library's digital collection may grow more slowly than demand.",
      word: "licensing",
      wordMeaning: "the granting of permission to use a product under specified conditions",
      purpose: "to explain how libraries are changing and what constrains them",
      tone: "balanced and explanatory",
      evidence: "rising licensing costs for e-books",
      structure: "expansion, benefit, then tension"
    },
    {
      text: "Roman concrete has survived for two thousand years in seawalls and domes that would challenge modern builders. Its durability appears to come partly from volcanic ash and from lumps of lime that react with seawater, sealing small cracks over time. Modern concrete is usually stronger in compression, but it lacks this self-healing behaviour. Engineers are now studying Roman recipes for structures exposed to water.",
      main: "Roman concrete's unusual ingredients gave it self-healing durability that modern engineers hope to adapt.",
      detail: "Lumps of lime in Roman concrete can react with seawater and seal small cracks.",
      inference: "Roman concrete may be especially useful in marine environments.",
      word: "durability",
      wordMeaning: "the ability to withstand wear, pressure or damage",
      purpose: "to explain why an ancient material remains relevant",
      tone: "admiring and analytical",
      evidence: "react with seawater, sealing small cracks over time",
      structure: "observation, explanation, modern relevance"
    },
    {
      text: "Migrating birds appear to combine several navigation systems. They can use the sun and stars as compasses, detect Earth's magnetic field, and recognize landmarks. No single cue works in every condition: clouds hide the stars, and magnetic signals can be disturbed. Experiments suggest that birds recalibrate one system against another, which makes their routes resilient when the weather changes.",
      main: "Birds navigate by combining multiple cues, which makes migration more reliable.",
      detail: "Clouds can prevent birds from using stars for navigation.",
      inference: "A bird with one impaired navigation sense may still migrate successfully.",
      word: "recalibrate",
      wordMeaning: "to adjust or check something again so it works accurately",
      purpose: "to explain how birds manage complex navigation",
      tone: "informative",
      evidence: "birds recalibrate one system against another",
      structure: "systems listed, limitation, then synthesis"
    },
    {
      text: "Sleep is not a passive shutdown. During deep sleep, the brain replays patterns of activity from the day, strengthening some memories and weakening others. This sorting may help people generalize from examples rather than simply storing them. Students who sleep after studying often perform better on tests than those who stay awake, even when total study time is the same.",
      main: "Sleep actively reorganizes memories and can improve learning.",
      detail: "During deep sleep, the brain replays activity patterns from the day.",
      inference: "Cramming all night may reduce the benefit of the time spent studying.",
      word: "generalize",
      wordMeaning: "to form a broad conclusion from particular examples",
      purpose: "to correct the idea that sleep is merely rest",
      tone: "informative and corrective",
      evidence: "Students who sleep after studying often perform better",
      structure: "claim, mechanism, evidence"
    },
    {
      text: "Remote work can increase focus by removing commutes and office interruptions, but it can also blur the boundary between work and rest. Some workers report longer hours because the office is always a few steps away. The effect depends heavily on management: clear expectations and protected off-hours tend to preserve wellbeing, while constant messaging erodes it.",
      main: "Remote work's benefits depend on boundaries and management practices.",
      detail: "Some remote workers report longer hours because work is always nearby.",
      inference: "A company policy limiting after-hours messages could improve remote wellbeing.",
      word: "erodes",
      wordMeaning: "gradually wears away or weakens",
      purpose: "to present a balanced view of remote work",
      tone: "measured",
      evidence: "constant messaging erodes it",
      structure: "benefit, drawback, condition"
    },
    {
      text: "Coral reefs bleach when unusually warm water causes corals to expel the algae that give them colour and food. A bleached reef is not necessarily dead; corals can recover if temperatures fall quickly. Repeated bleaching, however, leaves less time for recovery and can shift a reef from coral-dominated to seaweed-dominated. Scientists therefore track both heat stress and the frequency of events.",
      main: "Coral bleaching is recoverable in isolation but repeated heat stress can permanently change reefs.",
      detail: "Corals expel algae that provide colour and food during bleaching.",
      inference: "A reef that bleaches twice in quick succession is at greater risk than one that bleaches once.",
      word: "expel",
      wordMeaning: "to force something out",
      purpose: "to explain a process and its cumulative risk",
      tone: "scientific and cautious",
      evidence: "Repeated bleaching leaves less time for recovery",
      structure: "definition, recovery, cumulative risk"
    },
    {
      text: "Jazz improvisation is often described as spontaneous composition, but it depends on deep preparation. Musicians learn scales, chord progressions and hundreds of phrases so that they can respond without consciously searching for each note. The audience hears freedom; the performer is drawing on a repertoire built through years of practice. Constraint and invention are partners, not opposites.",
      main: "Jazz improvisation looks spontaneous but rests on extensive preparation and musical constraints.",
      detail: "Musicians learn scales, chord progressions and many phrases.",
      inference: "A beginning improviser may sound less free because they lack a large musical vocabulary.",
      word: "repertoire",
      wordMeaning: "a stock of skills or pieces a performer can draw on",
      purpose: "to challenge a misconception about improvisation",
      tone: "appreciative and analytical",
      evidence: "drawing on a repertoire built through years of practice",
      structure: "common view, correction, conclusion"
    },
    {
      text: "Voting by mail can make participation easier for people with limited mobility or unpredictable schedules. It also creates new administrative tasks: verifying signatures, tracking ballots and securing drop boxes. Studies generally find that mail voting does not favour one major party, although its effects vary by state and election. The design of the system matters more than the method alone.",
      main: "Mail voting expands access but its effects depend on how the system is designed.",
      detail: "Mail voting requires officials to verify signatures and secure drop boxes.",
      inference: "Two states with different mail-voting procedures may see different turnout effects.",
      word: "administrative",
      wordMeaning: "related to managing the practical operations of an organization",
      purpose: "to summarize evidence about a voting method",
      tone: "neutral and evidence-focused",
      evidence: "its effects vary by state and election",
      structure: "benefit, costs, evidence, qualification"
    },
    {
      text: "Soil is alive. A single teaspoon can contain billions of bacteria, along with fungi, protists and microscopic animals. These organisms break down dead matter, recycle nutrients and help plants absorb water. Farmers increasingly use cover crops and reduced tillage to protect this community, because bare, compacted soil loses both structure and fertility.",
      main: "Soil organisms are essential to nutrient cycling and can be protected by farming practices.",
      detail: "Soil organisms break down dead matter and recycle nutrients.",
      inference: "Repeated tillage may reduce a field's long-term fertility.",
      word: "compacted",
      wordMeaning: "pressed tightly together so air and water move less freely",
      purpose: "to explain the ecological value of soil life",
      tone: "informative and advocacy-minded",
      evidence: "bare, compacted soil loses both structure and fertility",
      structure: "claim, examples, practical response"
    },
    {
      text: "Museums are increasingly discussing whether objects acquired during colonial rule should return to their places of origin. Supporters of repatriation argue that communities should control their own heritage and that display without consent can perpetuate old power imbalances. Others worry that returns will empty galleries or separate objects from comparative collections. Many institutions now seek agreements that combine return with loans and shared research.",
      main: "Repatriation debates balance community control against museums' concerns about collections and access.",
      detail: "Some institutions seek agreements that combine return with loans and shared research.",
      inference: "A loan agreement may allow a returned object to remain available to researchers.",
      word: "repatriation",
      wordMeaning: "the return of something to its country or community of origin",
      purpose: "to present competing views on returning museum objects",
      tone: "balanced",
      evidence: "agreements that combine return with loans and shared research",
      structure: "issue, two positions, compromise"
    }
  ];

  function readingQuestion(rng) {
    const passage = pick(rng, PASSAGES);
    const type = ri(rng, 0, 7);
    let question;
    let correct;
    let wrongs;
    let hint;
    if (type === 0) {
      question = "Which statement best expresses the main idea of the passage?";
      correct = passage.main;
      wrongs = PASSAGES.filter(function (item) { return item !== passage; }).slice(0, 3).map(function (item) { return item.main; });
      hint = "Look for the claim that covers the whole passage, not one detail.";
    } else if (type === 1) {
      question = "Which detail is explicitly stated in the passage?";
      correct = passage.detail;
      wrongs = PASSAGES.filter(function (item) { return item !== passage; }).slice(0, 3).map(function (item) { return item.detail; });
      hint = "The correct answer must be directly supported by a sentence in the passage.";
    } else if (type === 2) {
      question = "Which inference is best supported by the passage?";
      correct = passage.inference;
      wrongs = PASSAGES.filter(function (item) { return item !== passage; }).slice(0, 3).map(function (item) { return item.inference; });
      hint = "An inference follows from the evidence but is not stated word for word.";
    } else if (type === 3) {
      question = "As used in the passage, what does \"" + passage.word + "\" most nearly mean?";
      correct = passage.wordMeaning;
      wrongs = ["a decorative pattern", "a legal penalty", "a sudden increase in speed"];
      hint = "Replace the word with each option and check which meaning fits the sentence.";
    } else if (type === 4) {
      question = "What is the main purpose of the passage?";
      correct = passage.purpose;
      wrongs = ["to entertain with a fictional story", "to advertise a commercial product", "to provide a step-by-step recipe"];
      hint = "Ask what the author is trying to accomplish for the reader.";
    } else if (type === 5) {
      question = "Which best describes the tone of the passage?";
      correct = passage.tone;
      wrongs = ["angry and sarcastic", "playful and joking", "urgent and panicked"];
      hint = "Tone is the author's attitude, not the topic.";
    } else if (type === 6) {
      question = "Which quotation provides the strongest evidence for the passage's main claim?";
      correct = passage.evidence;
      wrongs = PASSAGES.filter(function (item) { return item !== passage; }).slice(0, 3).map(function (item) { return item.evidence; });
      hint = "Choose the quotation that directly supports the main idea.";
    } else {
      question = "Which choice best describes the structure of the passage?";
      correct = passage.structure;
      wrongs = ["a single anecdote with no general claim", "a list of unrelated definitions", "a dialogue between two experts"];
      hint = "Track how the ideas move from the opening to the ending.";
    }
    return baseQuestion("Reading & Writing", passage.text + "\n\n" + question, correct, wrongs, hint,
      ["The passage supports this answer directly.", "The other choices either distort the passage or are not supported by it."],
      ["reading comprehension", passage.word]);
  }

  /* --------------------------------------------------------------------------
     Science, social studies, vocabulary and argument families
     -------------------------------------------------------------------------- */

  const SCIENCE = [
    ["Which organelle produces most of the ATP in a eukaryotic cell?", "Mitochondrion", ["Nucleus", "Ribosome", "Golgi apparatus"], "Mitochondria carry out aerobic respiration and generate most ATP."],
    ["What is the role of ribosomes?", "They assemble proteins from amino acids.", ["They store genetic information.", "They break down lipids.", "They package proteins for export."], "Ribosomes translate mRNA into polypeptide chains."],
    ["Which process converts light energy into chemical energy in plants?", "Photosynthesis", ["Cellular respiration", "Fermentation", "Transpiration"], "Photosynthesis uses light, water and carbon dioxide to make glucose."],
    ["What is the main function of DNA?", "It stores hereditary information.", ["It catalyzes all reactions.", "It forms the cell membrane.", "It transports oxygen."], "DNA carries the instructions for proteins and inheritance."],
    ["Which blood vessels carry blood away from the heart?", "Arteries", ["Veins", "Capillaries", "Lymph vessels"], "Arteries carry blood away from the heart; veins return it."],
    ["What is homeostasis?", "Maintaining a stable internal environment", ["Producing offspring", "Growing irreversibly", "Responding only to light"], "Homeostasis keeps temperature, pH and other conditions within workable ranges."],
    ["Which molecule is the main energy currency of the cell?", "ATP", ["DNA", "Glucose", "Hemoglobin"], "ATP releases usable energy when its phosphate bonds are broken."],
    ["What causes antibiotic resistance to spread?", "Natural selection favoring resistant bacteria", ["Bacteria learning to avoid drugs", "Vaccines changing bacterial DNA", "Antibiotics creating new species instantly"], "Resistant variants survive treatment and reproduce."],
    ["Which part of the atom determines the element?", "The number of protons", ["The number of neutrons", "The number of electrons", "The atomic mass"], "The proton count is the atomic number and defines the element."],
    ["What is the pH of a neutral solution at room temperature?", "7", ["0", "14", "1"], "Pure water has a pH of about 7."],
    ["Which bond involves sharing electrons?", "Covalent bond", ["Ionic bond", "Hydrogen bond", "Metallic bond"], "Covalent bonds share electron pairs between atoms."],
    ["What does the law of conservation of mass state?", "Mass is neither created nor destroyed in a chemical reaction.", ["Mass always increases.", "Mass becomes energy in every reaction.", "Mass depends on temperature only."], "Atoms are rearranged, not created or destroyed."],
    ["Which gas is produced when an acid reacts with a metal?", "Hydrogen", ["Oxygen", "Nitrogen", "Carbon dioxide"], "Acids react with many metals to release hydrogen gas."],
    ["What is an isotope?", "An atom with the same protons but a different number of neutrons", ["An atom with a different number of protons", "A molecule with two charges", "An ion with no electrons"], "Isotopes share an element's proton count but differ in neutrons."],
    ["Which is a physical change?", "Melting ice", ["Rusting iron", "Burning wood", "Baking a cake"], "Melting changes state without forming a new substance."],
    ["What is Newton's second law?", "Force equals mass times acceleration.", ["Every action has an equal opposite reaction.", "Objects at rest stay at rest unless acted on.", "Energy is always conserved."], "F = ma relates net force, mass and acceleration."],
    ["Which quantity is a vector?", "Velocity", ["Speed", "Mass", "Temperature"], "Velocity has both magnitude and direction."],
    ["What happens to kinetic energy when speed doubles?", "It quadruples.", ["It doubles.", "It halves.", "It stays the same."], "Kinetic energy is ½mv², so doubling v multiplies energy by four."],
    ["Which circuit type has one path for current?", "Series circuit", ["Parallel circuit", "Open circuit", "Short circuit"], "A series circuit provides a single path."],
    ["What is the unit of electrical resistance?", "Ohm", ["Volt", "Ampere", "Watt"], "Resistance is measured in ohms."],
    ["Which layer of Earth is liquid?", "Outer core", ["Inner core", "Crust", "Lithosphere"], "The outer core is liquid metal and generates the magnetic field."],
    ["What drives plate tectonics?", "Convection in the mantle", ["Tides in the ocean", "Rotation of the Moon", "Solar flares"], "Mantle convection moves lithospheric plates."],
    ["Which rock type forms from cooled magma?", "Igneous", ["Sedimentary", "Metamorphic", "Fossil"], "Igneous rock forms when magma or lava cools."],
    ["What is the water cycle process that turns vapor into liquid?", "Condensation", ["Evaporation", "Precipitation", "Transpiration"], "Condensation forms droplets as vapor cools."],
    ["Which gas is most abundant in Earth's atmosphere?", "Nitrogen", ["Oxygen", "Carbon dioxide", "Argon"], "Nitrogen makes up about 78% of the atmosphere."],
    ["What is an ecosystem?", "A community of organisms and their physical environment", ["A single species", "A laboratory experiment", "A type of rock"], "Ecosystems include living and nonliving components."],
    ["Which organism is a producer?", "A green plant", ["A mushroom", "A wolf", "A bacterium that eats sugar"], "Producers make their own food, usually by photosynthesis."],
    ["What is the role of decomposers?", "They break down dead matter and recycle nutrients.", ["They produce sunlight.", "They eat only living animals.", "They prevent all decay."], "Decomposers return nutrients to the soil."],
    ["Which is an example of natural selection?", "Insects resistant to a pesticide survive and reproduce.", ["A farmer plants identical crops.", "A lab adds a gene to a plant.", "A species migrates once."], "Heritable resistance becomes more common under selection."],
    ["What is a controlled variable?", "A factor kept the same across trials", ["The factor being changed", "The factor being measured", "A random error"], "Controlled variables make comparisons fair."],
    ["In an experiment, what is the independent variable?", "The factor the researcher changes", ["The factor measured", "The factor held constant", "The conclusion"], "The independent variable is deliberately manipulated."],
    ["What is a hypothesis?", "A testable proposed explanation", ["A final proof", "A random guess with no test", "A summary of all data"], "A hypothesis makes a prediction that can be tested."],
    ["Which graph best shows a trend over time?", "Line graph", ["Pie chart", "Venn diagram", "Scatter plot with no axis"], "Line graphs show change across a continuous variable."],
    ["What does a correlation of -0.9 indicate?", "A strong negative association", ["A weak positive association", "No association", "A perfect positive association"], "The magnitude is strong and the sign is negative."],
    ["Why do scientists repeat experiments?", "To test whether results are reliable", ["To make the sample smaller", "To remove the control", "To guarantee a positive result"], "Replication checks consistency and reduces chance effects."],
    ["Which is a renewable energy source?", "Solar", ["Coal", "Natural gas", "Petroleum"], "Solar energy is replenished naturally."],
    ["What is the greenhouse effect?", "Gases trap heat in the atmosphere", ["Gases block all sunlight", "The ocean cools the atmosphere", "Ozone destroys all radiation"], "Greenhouse gases absorb and re-emit infrared radiation."],
    ["Which human activity most directly increases atmospheric CO2?", "Burning fossil fuels", ["Planting forests", "Building wind turbines", "Recycling glass"], "Combustion releases carbon stored underground."],
    ["What is biodiversity?", "The variety of life in an area", ["The number of rocks", "The depth of an ocean", "The average temperature"], "Biodiversity includes species, genetic and ecosystem variety."],
    ["Which structure controls what enters and leaves a cell?", "Cell membrane", ["Nucleus", "Ribosome", "Vacuole"], "The membrane is selectively permeable."]
  ];

  const SOCIAL = [
    ["What is the main purpose of a constitution?", "To establish the structure and limits of government", ["To list every law", "To elect a president", "To collect taxes"], "A constitution defines institutions, powers and rights."],
    ["What does federalism divide?", "Power between national and regional governments", ["Power between two political parties", "Wealth among citizens", "Courts from legislatures"], "Federal systems share authority across levels."],
    ["Which branch interprets laws?", "Judicial", ["Legislative", "Executive", "Administrative"], "Courts interpret laws and review their constitutionality."],
    ["What is checks and balances?", "Each branch can limit the others", ["One branch controls all", "States ignore federal law", "Voters write bills"], "The system prevents concentration of power."],
    ["What is a primary source?", "A document or object created at the time of an event", ["A textbook summary", "A later encyclopedia entry", "A fictional film"], "Primary sources offer direct evidence from the period."],
    ["What is opportunity cost?", "The value of the next best alternative given up", ["The money paid in taxes", "The total cost of production", "The price of a stock"], "Every choice has a forgone alternative."],
    ["What happens to price when demand rises and supply is fixed?", "It tends to rise", ["It tends to fall", "It stays exactly the same", "It becomes zero"], "Competition for limited goods pushes prices up."],
    ["What is inflation?", "A general rise in the price level", ["A fall in all wages", "A rise in unemployment only", "A tax on imports"], "Inflation reduces purchasing power over time."],
    ["What is a tariff?", "A tax on imported goods", ["A limit on immigration", "A subsidy for exports", "A type of central bank"], "Tariffs raise the price of imports."],
    ["What is the role of a central bank?", "To manage monetary policy and stabilize the financial system", ["To write laws", "To collect income tax", "To run elections"], "Central banks set interest rates and supervise banks."],
    ["Which document begins \"We the People\"?", "The U.S. Constitution", ["The Declaration of Independence", "The Bill of Rights", "The Federalist Papers"], "The Preamble opens with that phrase."],
    ["What did the Declaration of Independence primarily do?", "Declare the colonies' separation from Britain", ["Create the federal court system", "End slavery", "Establish the Bill of Rights"], "It announced independence and listed grievances."],
    ["What was the Marshall Plan?", "A U.S. program to rebuild Western Europe after World War II", ["A plan to colonize Africa", "A treaty ending World War I", "A civil rights law"], "It provided economic aid and aimed to stabilize Europe."],
    ["What was the New Deal?", "A set of programs responding to the Great Depression", ["A Cold War alliance", "A civil rights amendment", "A tax cut in the 1980s"], "The New Deal expanded federal economic intervention."],
    ["What was the Harlem Renaissance?", "A flowering of Black art and literature in the 1920s", ["A labor strike in Chicago", "A post-Civil War amendment", "A jazz festival in New Orleans"], "It centered on Harlem and influenced American culture."],
    ["What was the main goal of the Civil Rights Movement?", "End racial segregation and secure equal rights", ["Expand westward settlement", "Reduce federal spending", "Create new colonies"], "Activists challenged segregation and disenfranchisement."],
    ["What is a monarchy?", "A system with a hereditary head of state", ["A system with no government", "A system ruled only by judges", "A system of direct democracy"], "Monarchs usually inherit their position."],
    ["What is a theocracy?", "A system in which religious authority shapes government", ["A system with no religion", "A system of pure capitalism", "A military dictatorship"], "Religious law or leaders hold formal power."],
    ["What is a market economy?", "Decisions are shaped mainly by prices and private choices", ["The government sets every price", "There is no private property", "Only barter is allowed"], "Markets coordinate through supply and demand."],
    ["What is a command economy?", "The government makes most production decisions", ["Prices alone decide", "Firms are all foreign-owned", "There is no planning"], "Central planners set output and prices."],
    ["What is the purpose of a census?", "To count and describe a population", ["To elect officials", "To set interest rates", "To declare war"], "Censuses inform representation and policy."],
    ["What is gerrymandering?", "Drawing district lines to favor a political group", ["Counting votes twice", "Limiting campaign spending", "Changing the voting age"], "The shape of districts can affect representation."],
    ["What is the Electoral College?", "A body that formally elects the U.S. president", ["A university for politicians", "A committee of state judges", "A type of primary election"], "Each state has electors based on its congressional delegation."],
    ["What is due process?", "Fair legal procedures before the government deprives someone of rights", ["A speedy election", "A tax refund", "A military draft"], "Due process protects notice, hearing and fair treatment."],
    ["What is the significance of Marbury v. Madison?", "It established judicial review.", ["It ended slavery.", "It created the Federal Reserve.", "It expanded voting rights."], "The case affirmed courts' power to review laws."],
    ["What is a push factor in migration?", "A condition that drives people away from a place", ["A job opening elsewhere", "A milder climate", "A better school"], "Push factors make the origin less attractive."],
    ["What is a pull factor in migration?", "A condition that attracts people to a place", ["A drought at home", "A war at home", "A flood at home"], "Pull factors draw people toward a destination."],
    ["What does GDP measure?", "The total value of goods and services produced in an economy", ["The number of workers", "The national debt only", "The average temperature"], "GDP is a broad output measure."],
    ["What is a trade deficit?", "Imports exceed exports", ["Exports exceed imports", "Taxes exceed spending", "Savings exceed investment"], "A deficit means a country buys more abroad than it sells."],
    ["What is the commons problem?", "Individuals overuse a shared resource", ["Governments ban all sharing", "Private firms avoid profit", "A resource is unlimited"], "Shared resources can be depleted without coordination."]
  ];

  const VOCAB = [
    ["ubiquitous", "present everywhere", ["rarely seen", "carefully hidden", "legally forbidden"]],
    ["pragmatic", "practical rather than idealistic", ["strictly theoretical", "highly emotional", "openly hostile"]],
    ["ambivalent", "having mixed feelings", ["completely certain", "deeply grateful", "totally indifferent"]],
    ["meticulous", "extremely careful about detail", ["careless", "spontaneous", "rude"]],
    ["candid", "honest and direct", ["secretive", "confused", "decorative"]],
    ["resilient", "able to recover quickly", ["easily broken", "permanently fixed", "unusually slow"]],
    ["tentative", "not fully certain or final", ["absolutely confirmed", "extremely loud", "morally wrong"]],
    ["concise", "brief and clear", ["long and repetitive", "vague and hidden", "angry and loud"]],
    ["novel", "new and original", ["familiar and old", "legally invalid", "extremely large"]],
    ["advocate", "to support or argue for", ["to oppose strongly", "to ignore", "to delay"]],
    ["mitigate", "to make less severe", ["to intensify", "to celebrate", "to measure"]],
    ["corroborate", "to confirm with evidence", ["to contradict", "to estimate", "to decorate"]],
    ["ambitious", "having a strong desire to achieve", ["lacking any goal", "easily satisfied", "physically weak"]],
    ["coherent", "logically consistent and clear", ["random and disordered", "extremely brief", "emotionally cold"]],
    ["empirical", "based on observation or experience", ["based only on theory", "purely fictional", "legally required"]],
    ["anomaly", "something that deviates from the norm", ["a common pattern", "a legal rule", "a type of average"]],
    ["credible", "believable and trustworthy", ["obviously false", "highly emotional", "extremely rare"]],
    ["redundant", "unnecessarily repetitive", ["perfectly concise", "newly invented", "legally binding"]],
    ["impartial", "not favoring one side", ["strongly biased", "easily angered", "physically distant"]],
    ["lucid", "clear and easy to understand", ["confusing", "hidden", "extremely brief"]],
    ["volatile", "likely to change suddenly", ["stable and predictable", "completely silent", "legally protected"]],
    ["scrupulous", "careful to be moral and accurate", ["dishonest", "careless", "lazy"]],
    ["superficial", "shallow or concerned only with surface", ["deeply thorough", "highly emotional", "legally complex"]],
    ["innovative", "introducing new ideas", ["copying old methods", "avoiding all change", "strictly traditional"]],
    ["exacerbate", "to make worse", ["to improve", "to ignore", "to measure"]],
    ["alleviate", "to relieve or lessen", ["to worsen", "to celebrate", "to replace"]],
    ["ambiguous", "open to more than one interpretation", ["perfectly clear", "factually proven", "legally void"]],
    ["coerce", "to force someone to act", ["to persuade gently", "to reward generously", "to ignore completely"]],
    ["diligent", "hardworking and careful", ["lazy and careless", "naturally talented", "easily distracted"]],
    ["indifferent", "having no particular interest", ["deeply concerned", "extremely excited", "openly hostile"]],
    ["plausible", "seeming reasonable or probable", ["obviously impossible", "morally wrong", "extremely rare"]],
    ["inhibit", "to restrain or slow down", ["to accelerate", "to celebrate", "to duplicate"]],
    ["substantiate", "to provide evidence for", ["to deny without evidence", "to exaggerate", "to simplify"]],
    ["tenacious", "persistent and determined", ["easily discouraged", "physically weak", "unusually quiet"]],
    ["cursory", "quick and superficial", ["extremely thorough", "highly emotional", "legally binding"]],
    ["implicit", "suggested but not directly stated", ["explicitly stated", "completely false", "legally required"]],
    ["explicit", "stated clearly and directly", ["implied only", "completely hidden", "emotionally vague"]],
    ["prudent", "showing careful judgment", ["reckless", "generous", "confused"]],
    ["obsolete", "no longer in use", ["brand new", "widely popular", "legally required"]],
    ["proficient", "competent or skilled", ["inexperienced", "uninterested", "dishonest"]]
  ];

  function scienceQuestion(rng) {
    const fact = pick(rng, SCIENCE);
    return baseQuestion("Science", fact[0], fact[1], fact[2], "Recall the underlying principle and eliminate choices that describe a different process.",
      [fact[3]], ["science reasoning", "concepts"]);
  }

  function dataInterpretation(rng) {
    const control = ri(rng, 20, 40);
    const treatment = control + ri(rng, 3, 15);
    const variable = pick(rng, ["plant height in cm", "enzyme activity", "reaction time in ms", "oxygen produced in mL"]);
    return baseQuestion("Science", "A control group averages " + control + " " + variable + " and a treatment group averages " + treatment + ". What is the most defensible conclusion?",
      "The treatment is associated with a higher average, but the study should be repeated before claiming causation.",
      ["The treatment definitely causes the increase.", "The control group was unnecessary.", "The difference proves the hypothesis is false."],
      "A single comparison shows an association, not proof of causation.",
      ["The treatment average is " + (treatment - control) + " units higher.", "Replication and control of other variables are still needed."],
      ["data interpretation", "experimental design"]);
  }

  function experimentDesign(rng) {
    const factor = pick(rng, ["temperature", "light intensity", "pH", "nutrient concentration"]);
    return baseQuestion("Science", "A student changes " + factor + " and measures the rate of a reaction. What is the independent variable?",
      factor, ["the reaction rate", "the amount of product", "the time of day"],
      "The independent variable is the one the researcher deliberately changes.",
      ["The student changes " + factor + ".", "The reaction rate is the dependent variable."],
      ["experimental design", "variables"]);
  }

  function graphConclusion(rng) {
    const first = ri(rng, 10, 30);
    const second = first + ri(rng, 5, 20);
    return baseQuestion("Science", "A graph shows a quantity rising from " + first + " to " + second + " as another variable increases. Which statement best describes the relationship?",
      "The two variables have a positive association.", ["The two variables have a negative association.", "There is no relationship.", "The graph proves causation."],
      "A positive association means both variables move in the same direction.",
      ["As one variable increases, the other also increases.", "Association alone does not prove causation."],
      ["graphs", "data interpretation"]);
  }

  function socialQuestion(rng) {
    const fact = pick(rng, SOCIAL);
    return baseQuestion("Social Studies", fact[0], fact[1], fact[2], "Identify the concept and eliminate answers that describe a different institution or process.",
      [fact[3]], ["social studies", "civics"]);
  }

  function documentQuestion(rng) {
    const pairs = [
      ["\"Governments are instituted among Men, deriving their just powers from the consent of the governed.\" Which principle does this express?", "Popular sovereignty", ["Divine right", "Hereditary privilege", "Judicial review"]],
      ["\"The powers delegated by the proposed Constitution to the federal government are few and defined.\" Which idea does this support?", "Limited federal power", ["Unlimited executive authority", "Abolition of the states", "Direct democracy"]],
      ["\"We hold these truths to be self-evident, that all men are created equal.\" Which ideal does this state?", "Natural equality", ["Economic equality", "Monarchy", "Military rule"]],
      ["\"Separate educational facilities are inherently unequal.\" Which case is this from?", "Brown v. Board of Education", ["Marbury v. Madison", "Plessy v. Ferguson", "Dred Scott v. Sandford"]]
    ];
    const pair = pick(rng, pairs);
    return baseQuestion("Social Studies", pair[0], pair[1], pair[2], "Connect the quotation to the principle or case it is known for.",
      ["The wording points to " + pair[1] + "."], ["primary sources", "civics"]);
  }

  function vocabQuestion(rng) {
    const entry = pick(rng, VOCAB);
    return baseQuestion("Verbal Reasoning", "Which choice is closest in meaning to \"" + entry[0] + "\"?",
      entry[1], entry[2], "Replace the word in a sentence and check which meaning fits.",
      ["\"" + entry[0] + "\" means " + entry[1] + "."], ["vocabulary", "verbal reasoning"]);
  }

  function assumption(rng) {
    const topic = pick(rng, ["a new transit line", "a school schedule change", "a remote-work policy", "a recycling campaign"]);
    return baseQuestion("Analytical Writing", "An argument claims that " + topic + " will improve outcomes because a similar policy worked in another city. Which assumption is required?",
      "Conditions in the two cities are similar enough for the comparison to hold.",
      ["The other city's policy was popular.", "The policy costs nothing.", "All residents agree with the goal."],
      "Find the unstated bridge between the evidence and the conclusion.",
      ["The evidence is a comparison with another city.", "The argument needs the comparison to be relevant."],
      ["arguments", "assumptions"]);
  }

  function strengthen(rng) {
    return baseQuestion("Analytical Writing", "Which finding would most strengthen a claim that a tutoring program raises test scores?",
      "Students randomly assigned to the program scored higher than a control group.",
      ["The program's founder is well known.", "Many students enjoy the program.", "The program is offered after school."],
      "Look for evidence that isolates the program's effect.",
      ["A randomized comparison controls for other differences.", "Enjoyment and timing do not establish an effect on scores."],
      ["arguments", "evidence"]);
  }

  function weaken(rng) {
    return baseQuestion("Analytical Writing", "Which finding would most weaken a claim that a new drug reduces recovery time?",
      "Patients taking the drug were also more likely to receive additional treatment.",
      ["The drug was tested in several hospitals.", "The study included 500 patients.", "The drug is easy to administer."],
      "Look for a confounding variable that offers another explanation.",
      ["If the drug group received extra treatment, the improvement may not be due to the drug.", "That is a confounding variable."],
      ["arguments", "evidence"]);
  }

  function flaw(rng) {
    return baseQuestion("Analytical Writing", "An advertisement says a laptop is the best because it is the most popular. Which flaw does this argument contain?",
      "It assumes popularity proves quality.",
      ["It uses too many statistics.", "It relies on a controlled experiment.", "It defines every term precisely."],
      "Identify the gap between the evidence and the conclusion.",
      ["Popularity is not the same as quality.", "The argument confuses the two."],
      ["arguments", "logical flaws"]);
  }

  function conclusion(rng) {
    return baseQuestion("Analytical Writing", "A study finds that students who read for pleasure also score higher on vocabulary tests. Which conclusion is best supported?",
      "There is an association between pleasure reading and vocabulary, but the study does not prove causation.",
      ["Pleasure reading definitely causes higher vocabulary.", "Vocabulary causes pleasure reading.", "No relationship exists."],
      "Observational data support association, not causation.",
      ["The study compares existing groups rather than assigning reading.", "Association is the safest conclusion."],
      ["arguments", "causation"]);
  }

  /* --------------------------------------------------------------------------
     Exam definitions
     -------------------------------------------------------------------------- */

  const MATH_ALG = [linear, slope, system, inequality, absolute, functionEval, exponentProduct, sequence, proportion, costEquation];
  const MATH_ADV = [quadratic, vertex, discriminant, composition, exponentQuotient, exponentProduct, functionEval, sequence, absolute, system];
  const MATH_DATA = [percentDiscount, percentIncrease, ratio, mean, median, range, probability, tableDifference, unitRate, scaleMap, averageSpeed];
  const MATH_GEO = [rectangle, triangleAngles, circle, pythagorean, midpoint, distance, volume, trigRatio, areaTriangle, slope];
  const MATH_ALL = MATH_ALG.concat(MATH_ADV, MATH_DATA, MATH_GEO);
  const GRAMMAR = [subjectVerb, pronounCase, apostrophe, semicolon, colon, modifier, parallel, tense, transition, concision, whoWhom, itsItS, fewerLess, betweenAmong, comparative, fragment, runOn, activeVoice, commaList, apostrophePlural, subjectPronoun, danglingInfinitive, dash, quotation];
  const SCIENCE_ALL = [scienceQuestion, dataInterpretation, experimentDesign, graphConclusion];
  const SOCIAL_ALL = [socialQuestion, documentQuestion];
  const VERBAL = [vocabQuestion, readingQuestion];
  const ARGUMENT = [assumption, strengthen, weaken, flaw, conclusion];

  const EXAMS = [
    {
      id: "sat",
      title: "SAT",
      level: "Intermediate",
      accent: "amber",
      blurb: "Digital SAT maths, reading and writing with a timed section builder and full explanations.",
      tags: ["SAT", "college admission", "math", "reading", "writing", "test prep"],
      examFormat: "Digital SAT · 2 hours 14 minutes · adaptive modules in Math and Reading & Writing",
      testConfig: { questions: 22, secondsPerQuestion: 75, label: "Timed SAT section" },
      seed: 1201,
      plan: [
        { topic: "Algebra", count: 240, families: MATH_ALG },
        { topic: "Advanced Math", count: 240, families: MATH_ADV },
        { topic: "Problem Solving & Data", count: 120, families: MATH_DATA },
        { topic: "Geometry & Trigonometry", count: 100, families: MATH_GEO },
        { topic: "Reading & Writing", count: 300, families: GRAMMAR.concat([readingQuestion]) }
      ]
    },
    {
      id: "act",
      title: "ACT",
      level: "Intermediate",
      accent: "sky",
      blurb: "ACT English, maths, reading and science practice with fast-paced timed sections.",
      tags: ["ACT", "college admission", "English", "math", "reading", "science"],
      examFormat: "ACT · 2 hours 55 minutes · English, Math, Reading and Science",
      testConfig: { questions: 20, secondsPerQuestion: 50, label: "Timed ACT section" },
      seed: 2202,
      plan: [
        { topic: "English", count: 250, families: GRAMMAR },
        { topic: "Math", count: 300, families: MATH_ALL },
        { topic: "Reading", count: 250, families: VERBAL },
        { topic: "Science", count: 200, families: SCIENCE_ALL }
      ]
    },
    {
      id: "psat",
      title: "PSAT/NMSQT",
      level: "Intermediate",
      accent: "teal",
      blurb: "PSAT maths and evidence-based reading and writing, with National Merit-style practice.",
      tags: ["PSAT", "NMSQT", "National Merit", "math", "reading", "writing"],
      examFormat: "PSAT/NMSQT · 2 hours 14 minutes · Math and Reading & Writing",
      testConfig: { questions: 20, secondsPerQuestion: 70, label: "Timed PSAT section" },
      seed: 3203,
      plan: [
        { topic: "Algebra", count: 240, families: MATH_ALG },
        { topic: "Advanced Math", count: 220, families: MATH_ADV },
        { topic: "Problem Solving & Data", count: 140, families: MATH_DATA },
        { topic: "Geometry & Trigonometry", count: 100, families: MATH_GEO },
        { topic: "Reading & Writing", count: 300, families: GRAMMAR.concat([readingQuestion]) }
      ]
    },
    {
      id: "ged",
      title: "GED",
      level: "Beginner",
      accent: "violet",
      blurb: "GED maths, reasoning through language arts, science and social studies in one bank.",
      tags: ["GED", "high school equivalency", "math", "language arts", "science", "social studies"],
      examFormat: "GED · four subject tests · Math, Reasoning Through Language Arts, Science, Social Studies",
      testConfig: { questions: 20, secondsPerQuestion: 65, label: "Timed GED section" },
      seed: 4204,
      plan: [
        { topic: "Mathematical Reasoning", count: 300, families: MATH_ALL },
        { topic: "Reasoning Through Language Arts", count: 300, families: GRAMMAR.concat([readingQuestion]) },
        { topic: "Science", count: 200, families: SCIENCE_ALL },
        { topic: "Social Studies", count: 200, families: SOCIAL_ALL }
      ]
    },
    {
      id: "gre",
      title: "GRE",
      level: "Advanced",
      accent: "rose",
      blurb: "GRE verbal, quantitative and analytical writing practice for graduate admission.",
      tags: ["GRE", "graduate admission", "verbal", "quantitative", "analytical writing"],
      examFormat: "GRE General Test · about 1 hour 58 minutes · Verbal, Quant and Analytical Writing",
      testConfig: { questions: 20, secondsPerQuestion: 90, label: "Timed GRE section" },
      seed: 5205,
      plan: [
        { topic: "Verbal Reasoning", count: 400, families: VERBAL },
        { topic: "Quantitative Reasoning", count: 400, families: MATH_ALL },
        { topic: "Analytical Writing", count: 200, families: ARGUMENT }
      ]
    }
  ];

  const STUDY = {
    sat: {
      study: [
        { id: "sat-s1", title: "How the Digital SAT Works", icon: "monitor", summary: "Two sections, adaptive modules, and a calculator available throughout Math.", points: ["Reading & Writing comes first; Math follows.", "Each section has two modules, and the second adapts to the first.", "The built-in Desmos calculator is available for the whole Math section.", "Wrong answers do not cost points, so never leave a blank."] },
        { id: "sat-s2", title: "Reading & Writing Moves", icon: "pencil-line", summary: "Most questions ask you to choose the answer that best uses evidence or follows the rules of standard English.", points: ["Read the question before the passage so you know what to look for.", "For grammar, isolate the underlined portion and check the sentence boundaries.", "For evidence questions, eliminate choices that are true but irrelevant.", "Transitions must match the logical relationship, not just sound formal."] },
        { id: "sat-s3", title: "Math Without a Calculator Crutch", icon: "calculator", summary: "The test rewards structure: translate the word problem, then choose the fastest valid method.", points: ["Write the equation before computing.", "Back-solve from answer choices when the algebra is messy.", "Know the vertex, discriminant and slope formulas cold.", "Check units and whether the question asks for a value or an expression."] },
        { id: "sat-s4", title: "A 22-Question Section Plan", icon: "timer", summary: "Use the timed section builder to practise pacing, then review every miss.", points: ["Spend about 75 seconds per question on average.", "Flag a question and move on rather than sinking four minutes into it.", "Leave time to transfer or check answers.", "After grading, write down the reason for every miss, not just the right letter."] }
      ],
      mistakes: ["Answering the question you expected instead of the one written.", "Choosing a grammatically correct sentence that does not answer the prompt.", "Forgetting that the second module adapts to the first.", "Leaving blanks because wrong answers feel risky."],
      tips: [
        { title: "One Passage, One Job", icon: "book-open", body: "For reading questions, name the passage's job in six words before looking at the choices. That summary filters out answers that are true but off-topic." },
        { title: "Split the Equation", icon: "split", body: "When a word problem looks long, underline the quantity being asked for and write a let statement. Most errors are translation errors, not arithmetic errors." },
        { title: "Review by Error Type", icon: "clipboard-check", body: "Tag each miss as content, careless, pacing or question-reading. After ten misses, the pattern tells you what to study next." }
      ]
    },
    act: {
      study: [
        { id: "act-s1", title: "Four Tests, Four Rhythms", icon: "timer", summary: "ACT sections are fast; pacing is part of the content.", points: ["English: 75 questions in 45 minutes.", "Math: 60 questions in 60 minutes.", "Reading: 40 questions in 35 minutes.", "Science: 40 questions in 35 minutes."] },
        { id: "act-s2", title: "English Is Mostly Boundaries", icon: "pencil-line", summary: "Most ACT English questions test punctuation, agreement and concision.", points: ["Check whether each side of punctuation is a complete clause.", "Prefer the shortest correct option when meaning is unchanged.", "Match pronouns to their actual antecedents.", "Keep verb tense consistent unless the sentence signals a shift."] },
        { id: "act-s3", title: "Science Is Reading With Data", icon: "flask-conical", summary: "You do not need advanced science knowledge for most ACT Science questions.", points: ["Read the axes, units and legend first.", "Find the trend before reading every number.", "Use the passage to define unfamiliar terms.", "Beware of choices that are true but not supported by the data."] },
        { id: "act-s4", title: "The Two-Pass Strategy", icon: "list-checks", summary: "Do the straightforward questions first, then return to the multi-step ones.", points: ["First pass: answer what you can in under a minute.", "Second pass: return to flagged questions.", "Never leave a bubble empty.", "Keep an eye on the section clock, not the overall clock."] }
      ],
      mistakes: ["Spending too long on one reading passage.", "Choosing a word that sounds sophisticated but does not fit the sentence.", "Ignoring the units in a science graph.", "Changing a correct answer without a concrete reason."],
      tips: [
        { title: "Mark the Contrast", icon: "arrows-left-right", body: "In reading and science, circle however, but and unlike. Most questions turn on a contrast, and the answer usually lives near it." },
        { title: "Estimate First", icon: "calculator", body: "On ACT Math, estimate the answer before computing. If the choices are far apart, estimation saves a minute and catches unit errors." },
        { title: "Bubble in Blocks", icon: "grid-3x3", body: "Transfer answers in small blocks rather than one at a time. It protects against off-by-one bubbling without wasting time." }
      ]
    },
    psat: {
      study: [
        { id: "psat-s1", title: "A Smaller SAT, Same Skills", icon: "file-text", summary: "The PSAT uses the same adaptive structure and question styles as the SAT.", points: ["Reading & Writing and Math each have two modules.", "The second module adapts to your first-module performance.", "Scores can qualify for National Merit recognition.", "The built-in calculator is available on Math."] },
        { id: "psat-s2", title: "National Merit Timing", icon: "calendar-check", summary: "The PSAT is also a scholarship qualifying test, so timing and accuracy both matter.", points: ["Take a full timed practice test before test day.", "Review the easiest misses first.", "Do not skip the optional essay unless your school requires it.", "Check your school's test date and registration process."] },
        { id: "psat-s3", title: "Build a Reading Habit", icon: "book-open", summary: "The best long-term preparation is reading challenging nonfiction regularly.", points: ["Read one science or history article a day.", "Summarize the main claim in one sentence.", "Notice how the author uses evidence.", "Look up unfamiliar words and use them once."] },
        { id: "psat-s4", title: "Math Formulas to Know", icon: "sigma", summary: "The reference sheet helps, but knowing the core formulas saves time.", points: ["Slope, midpoint and distance.", "Circle area and circumference.", "Quadratic vertex and discriminant.", "Mean, median and percent change."] }
      ],
      mistakes: ["Treating the PSAT as a throwaway test.", "Skipping the full-length timed practice.", "Ignoring National Merit deadlines.", "Over-focusing on hard questions before mastering easy ones."],
      tips: [
        { title: "Read Like a Test Writer", icon: "search", body: "After each practice passage, ask what one detail the test writer could turn into a question. You will start noticing the evidence that matters." },
        { title: "Two-Column Review", icon: "columns-2", body: "Split a page into 'I knew it' and 'I guessed'. Review the guessed questions first; they are the fastest score gains." },
        { title: "Sleep Before Test Day", icon: "moon", body: "A rested brain outperforms a crammed one. Stop studying early the night before and protect your morning routine." }
      ]
    },
    ged: {
      study: [
        { id: "ged-s1", title: "Four Subject Tests", icon: "layers", summary: "The GED is modular: take the subjects in the order that suits your schedule.", points: ["Mathematical Reasoning: 115 minutes.", "Reasoning Through Language Arts: 150 minutes.", "Science: 90 minutes.", "Social Studies: 70 minutes."] },
        { id: "ged-s2", title: "Math That Shows Up", icon: "calculator", summary: "The GED math test focuses on practical arithmetic, algebra, geometry and data.", points: ["Practice multi-step word problems.", "Know how to work with fractions, decimals and percents.", "Use the on-screen calculator when allowed.", "Write units in your final answer."] },
        { id: "ged-s3", title: "RLA Is Evidence-Based", icon: "file-text", summary: "The language arts test asks you to read, revise and write extended responses.", points: ["Identify the main claim and supporting evidence.", "Practise the extended response with a clear thesis.", "Edit for sentence boundaries and agreement.", "Manage the clock across reading and writing."] },
        { id: "ged-s4", title: "Science and Social Studies Are Reading Tests", icon: "globe", summary: "Both tests ask you to interpret charts, passages and documents.", points: ["Read the question before the stimulus.", "Check units and labels on every graph.", "Eliminate choices not supported by the source.", "Use process of elimination on document questions."] }
      ],
      mistakes: ["Ignoring the extended response.", "Forgetting units in math answers.", "Reading every passage before the questions.", "Assuming science requires memorized advanced facts."],
      tips: [
        { title: "One Skill a Day", icon: "calendar-check", body: "Study one narrow skill per day, then answer ten questions on it. A steady schedule beats a weekend cram." },
        { title: "Write the Thesis First", icon: "pencil-line", body: "For the extended response, write a one-sentence thesis before drafting. Every paragraph should support that sentence." },
        { title: "Use the Calculator Wisely", icon: "calculator", body: "The calculator is a tool, not a strategy. Estimate first, then use it to confirm." }
      ]
    },
    gre: {
      study: [
        { id: "gre-s1", title: "Verbal Is Vocabulary in Context", icon: "book-open", summary: "The GRE tests precise word meaning and the logic of sentences and passages.", points: ["Learn words in families and opposites.", "For text completion, predict the blank before reading choices.", "For sentence equivalence, choose two words that produce the same meaning.", "For reading, separate the author's claim from the evidence."] },
        { id: "gre-s2", title: "Quant Rewards Structure", icon: "sigma", summary: "The GRE quantitative section tests arithmetic, algebra, geometry and data interpretation.", points: ["Compare quantities before computing.", "Use plug-in values for variables.", "Know the difference between median and mean.", "Check whether the question asks for an approximation."] },
        { id: "gre-s3", title: "Analytical Writing Is an Argument", icon: "pencil-line", summary: "The essay asks you to evaluate an argument, not to agree with its conclusion.", points: ["Identify the conclusion and the evidence.", "Name the assumptions that connect them.", "Explain how the argument could be strengthened or weakened.", "Leave time to proofread."] },
        { id: "gre-s4", title: "Adaptive Pacing", icon: "timer", summary: "The second section adapts to the first, so accuracy early matters.", points: ["Do not rush the first section.", "Flag and return rather than stalling.", "Practise with the on-screen calculator.", "Take at least one full timed test."] }
      ],
      mistakes: ["Studying vocabulary without context.", "Treating the essay as a personal opinion piece.", "Forgetting that quantitative comparison has a 'cannot be determined' option.", "Ignoring the second-section adaptation."],
      tips: [
        { title: "Word Families", icon: "layers", body: "Group words by meaning and tone: praise, criticize, uncertain, certain. The GRE often tests your ability to distinguish nearby shades." },
        { title: "Name the Assumption", icon: "search", body: "For every argument, write the missing link in one sentence. That sentence is usually the core of your essay." },
        { title: "Calculator Discipline", icon: "calculator", body: "Use the calculator only after you have set up the problem. It will not choose the right operation for you." }
      ]
    }
  };

  function buildBank(exam) {
    const rng = mulberry32(exam.seed);
    const questions = [];
    const seen = new Set();
    exam.plan.forEach(function (plan) {
      for (let index = 0; index < plan.count; index += 1) {
        const family = plan.families[index % plan.families.length];
        let draft = family(rng, index);
        if (!draft || !draft.prompt) continue;
        if (seen.has(draft.prompt)) {
          draft = Object.assign({}, draft, { prompt: draft.prompt });
        }
        seen.add(draft.prompt);
        const target = questions.length % 4;
        const placed = placeOptions(draft.correct, draft.wrongs, target);
        const number = String(questions.length + 1).padStart(4, "0");
        const tags = [plan.topic].concat((draft.tags || []).filter(function (tag) {
          return tag !== plan.topic;
        })).slice(0, 4);
        questions.push({
          id: exam.id + "-" + number,
          difficulty: index % 7 === 0 ? "Advanced" : index % 4 === 0 ? "Beginner" : "Intermediate",
          tags: tags,
          prompt: draft.prompt,
          options: placed.options,
          answer: placed.answer,
          hint: draft.hint,
          explanation: draft.explanation
        });
      }
    });
    return questions;
  }

  const subjects = EXAMS.map(function (exam) {
    const copy = STUDY[exam.id];
    return {
      id: exam.id,
      title: exam.title,
      icon: "graduation-cap",
      accent: exam.accent,
      level: exam.level,
      blurb: exam.blurb,
      tags: exam.tags,
      track: "exam",
      trackLabel: "Exam prep",
      examFormat: exam.examFormat,
      testConfig: exam.testConfig,
      questions: buildBank(exam),
      study: copy.study,
      mistakes: copy.mistakes,
      tips: copy.tips,
      videos: []
    };
  });

  window.ExamPrepContent = {
    SCIENCE: SCIENCE,
    SOCIAL: SOCIAL,
    VOCAB: VOCAB,
    PASSAGES: PASSAGES,
    MATH_ALL: MATH_ALL,
    MATH_ALG: MATH_ALG,
    MATH_ADV: MATH_ADV,
    MATH_DATA: MATH_DATA,
    MATH_GEO: MATH_GEO
  };

  const category = {
    id: "exam-prep",
    title: "Exam Prep",
    tagline: "SAT, ACT, PSAT, GED and GRE — 1,000 practice questions per exam, with timed sections and full explanations.",
    icon: "graduation-cap",
    accent: "amber",
    subjects: subjects
  };

  const insertAt = DATA.categories.findIndex(function (item) { return item.id === "ap-courses"; });
  DATA.categories.splice(insertAt >= 0 ? insertAt + 1 : 0, 0, category);

  subjects.forEach(function (subject) {
    if (subject.questions.length !== TARGET_PER_EXAM) {
      console.warn("Questionaire exam bank " + subject.id + " has " + subject.questions.length + " questions.");
    }
  });
})();
