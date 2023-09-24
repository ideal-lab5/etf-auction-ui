import { createContext, useEffect, useRef } from "react";

const EtfContext = createContext(null);

type EtfProviderProps = {
	children?: React.ReactNode;
};

export const EtfProvider: React.FC<EtfProviderProps> = (props) => {
	const { children } = props;

	const etf = useRef();

	useEffect(() => {}, []);

	return <EtfContext.Provider value={etf}>{children}</EtfContext.Provider>;
};
