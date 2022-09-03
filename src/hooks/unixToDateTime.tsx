export default function unixToDateTime(timestamp: number, timezone: string) {
	const unix_timestamp = timestamp;
	// Create a new JavaScript Date object based on the timestamp
	// multiplied by 1000 so that the argument is in milliseconds, not seconds.
	const date = new Date(unix_timestamp * 1000);
	// Hours part from the timestamp
	// const hours = date.getHours();
	// // Minutes part from the timestamp
	// const minutes = "0" + date.getMinutes();
	// // Seconds part from the timestamp
	// const seconds = "0" + date.getSeconds();

	// // Will display time in 10:30:23 format
	// const formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

	if (timezone === "utc") {
		return date.toUTCString();
	} else if (timezone === "local") {
		return date.toLocaleString([], {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	} else {
		return "Undefined Date";
	}
}
