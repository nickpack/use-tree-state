# v1.0.4 (2021.6.5)
README update

# v1.0.3 (2021.6.5)
solved a bug for infinite render. Internally shouldn't call initialize tree state when data change, since if data is defined in the functional component, each time it is a different reference.

Instead we should expsoe a api `reinitializa()` in the future.

# v1.0.2 (2021.6.4)
fixed a bug in custom reducer
# v1.0.1 (2021.6.4)
README update
# v1.0.0 (2021.6.3)
First release!! ✨✨
