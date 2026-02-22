# minitap-mobile-use requires Python 3.12+

## Fact
The `minitap-mobile-use` PyPI package has a hard dependency on Python >=3.10, with most versions requiring >=3.12.

## Versions Affected
- 0.0.1.dev0: >=3.10
- 2.0.0+: >=3.10
- 2.0.1+: >=3.12
- All versions 2.0.1 through 3.5.3 require >=3.12

## Implication
Systems with Python <3.10 cannot install minitap at all. Systems with Python 3.10-3.11 can only use version 0.0.1.dev0 or 2.0.0. Python 3.12+ recommended for latest versions.
