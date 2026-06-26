// Local heuristic one-liners. Used as the offline (mock) generator and as the
// fallback when the LLM-polish endpoint is unavailable. The live experience
// prefers /api/oneliners, which rewrites these into clean, polished copy.

export function localOneLiners(answers) {
  const product = answers['00'] || '[product]';
  const user = answers['01'] || '[user]';
  const obstacle = answers['02a'] || '[obstacle]';
  const belief = answers['02c'] || '[belief]';
  const transformation = answers['07'] || '[transformation]';
  const cost = answers['06'] || '[cost]';

  const shortCost = cost.split(/[.,;]/)[0].trim();
  const shortObstacle = obstacle.split(/[.,;]/)[0].trim();
  const shortTransformation = transformation.split(/[.,;]/)[0].trim();

  return [
    { label: 'Outcome-led', use: 'Best for homepage hero',
      text: `${product} helps ${user.toLowerCase()} ${shortTransformation.toLowerCase()}. Without ${shortCost.toLowerCase()}.` },
    { label: 'Obstacle-led', use: 'Best for sales decks and outbound',
      text: `${user} struggle with ${shortObstacle.toLowerCase()}. ${product} helps them ${shortTransformation.toLowerCase()}.` },
    { label: 'Belief-led', use: 'Best for thought leadership and founder posts',
      text: `${belief} ${product} helps ${user.toLowerCase()} ${shortTransformation.toLowerCase()}.` },
  ];
}
