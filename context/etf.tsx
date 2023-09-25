/* import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Etf } from '@ideallabs/etf.js';

interface EtfContextValues {
	api: Etf<{}>
	latestSlot: any
	ready: boolean
}

const EtfContext = createContext<EtfContextValues>(null);

type EtfProviderProps = {
	children?: React.ReactNode;
};

// Hook for easy access from anywhere in the component tree
export const useEtf = (): EtfContextValues => {
	return useContext(EtfContext)
}

export const EtfProvider: React.FC<EtfProviderProps> = (props) => {
	const { children } = props;

	const api = useRef(new Etf());
  const [latestSlot, setLatestSlot] = useState(null)
  const [ready, setReady] = useState(false)

	useEffect(() => {
		const setup = async () => {
			const timeout = new Promise((_, reject) => {
				setTimeout(() => reject('ETF connection timeout.'), 5000);
			});

			await Promise.race([
				api.current.init(),
				timeout
			]);

      api.current.eventEmitter.on('blockHeader', () => {
        setLatestSlot(api.current.latestSlot)
      })

			setReady(true)
		}

		setup().catch((err) => {
			console.error(err)
		})
	}, []);

	return <EtfContext.Provider value={{ api: api.current, latestSlot, ready }}>{children}</EtfContext.Provider>;
};
 */