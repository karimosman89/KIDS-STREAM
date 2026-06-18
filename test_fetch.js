async function test() {
  const res = await fetch('http://localhost:3000/api/videos/external');
  const data = await res.json();
  console.log("Total DB videos external:", data.videos.length);
  const matched = data.videos.filter(v => typeof v.id === 'string' && v.id.startsWith('ia_')).length;
  console.log("IA items in external endpoint:", matched);
}
test();
