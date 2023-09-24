import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Etf } from '@ideallabs/etf.js';

interface EtfContextValues {
	api: Etf<{}>
	latestSlot: any
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

	useEffect(() => {
		const setup = async () => {
      await api.current.init()

      api.current.eventEmitter.on('blockHeader', () => {
        setLatestSlot(api.current.latestSlot)
      })
		}

		setup()
	}, []);

	return <EtfContext.Provider value={{ api: api.current, latestSlot }}>{children}</EtfContext.Provider>;
};
