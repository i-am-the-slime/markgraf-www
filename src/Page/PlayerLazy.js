// Dynamic import of markgraf-react. The literal specifier lets the bundler split
// MarkgrafPlayer (~95KB-gz) into its own async chunk; resolves to the component.
// Effect (Promise (ReactComponent props)) => () => Promise.
export const importPlayerImpl = () =>
  import("@markgrafhq/markgraf-react").then((m) => m.MarkgrafPlayer)
