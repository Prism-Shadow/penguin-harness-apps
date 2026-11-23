/** Keep versions distributed before GitHub Releases byte-identical. The digests were measured
 * on the tarballs at 4ad6cc1a55d74bd2b877a159e60147f89628b210, which remain accessible there. */
import integrities from "./legacy-package-integrities.json" with { type: "json" };

export function checkLegacyIntegrity({ name, version, integrity }) {
  const key = `${name}@${version}`;
  const previous = integrities[key];
  if (previous && previous !== integrity)
    throw new Error(
      `The existing distribution of ${key} has a different SHA-512. Choose a new version.`,
    );
}
