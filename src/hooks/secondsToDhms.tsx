export default function secondsToDhms(seconds: number) {
	seconds = Number(seconds);
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	const dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
	const hDisplay = h > 0 ? h + (h == 1 ? " hr " : " hrs ") : "";
	const mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
	const sDisplay = s > 0 ? s + (s == 1 ? " sec" : " secs") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}
