export default function dateToUnix(date: string) {
	return Date.parse(date) / 1000;
	// parseInt((new Date(date).getTime() / 1000).toFixed(0));
}
