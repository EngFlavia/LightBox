# LightBox TR_001 Recovery Design

## Goal

Recover the approved TR_001 interface behavior in the active LightBox source while preserving the current PNG export implementation.

## Scope

- Show the transformation controls only after the user taps **Editar**.
- Remove the separate **Redefinir** action. **Original** restores image filters, zoom, and position.
- Present status feedback as a fading toast for two seconds, using **Liberado** and **Bloqueado** for gesture state.
- Add persisted PT, ES and EN user-interface translations.
- Keep the existing save-as-PNG flow unchanged.

## Recovery Method

Apply the behavior verified in TR_001 to the current source, covered first by automated tests. Do not overwrite the image-export module or the existing Android wrapper.
