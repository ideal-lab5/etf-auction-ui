import { EtfProvider } from "../context/etf";
import "../style/globals.css";
import "reflect-metadata";

export default function MyApp({ Component, pageProps }) {
	return (
		<EtfProvider>
			<Component {...pageProps} />;
		</EtfProvider>
	);
}
