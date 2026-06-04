// Auto-thin re-export. PureScript is the source; this binds it to Next.
import "./globals.css";
import Root, { metadata as psMetadata } from "../output/Layout.Root/index.js";

export const metadata = {
  ...psMetadata,
  icons: {
    icon: "/logo/markgraf.svg",
    apple: "/logo/markgraf.svg",
  },
};

export default Root;
