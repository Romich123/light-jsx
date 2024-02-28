# Changelog
## 0.6.2 (28-02-2024)
Removed a lot of @ts-ignore.

For now lifetime events are removed as they didn't function properly. \
Probably next update will be fully revolved around them. \
Currently don't know how to implement them properly, but one day i will.
## 0.6.1 (26-02-2024)
Fragment unwrapping led to errors (who could have thought?)
Fixed this errors

Testing components's lifetime events
## 0.6.0 (26-02-2024)
# Fragments are now unwrapped.

Earlier i made so that every jsx transform into single node, that led to fragments wraping their children into special div.
Now when this special div is passed as child this will result in ignoring it and just passing it's children forward.
Note: fragment will still wrap children if it doen't have jsx parent.

# Now components treated as functions (currently may leed to unexpected behaviour).

How it worked before:
function treated as reactive state and will rerender every time signal inside it changes.
components may be seem as functions but actually they are called before passing it as child, resulting in them being just Node, which lead to full app rerenders when some state changed in child component

How it works now:
functions still function the same
components treated the as functions

Note: rerender of function will just call it, so if it has signals inside, they will be created again, losing old state
## 0.5.0 (25-02-2024)
No longer escaping html when setting attributes, because it only led to problems.
## 0.4.2 (25-02-2024)
Fixed urls
## 0.4.1 (25-02-2024)
bug fixes
## 0.4.0 (16-02-2024)
Now every JSX.Element is a single node. Currently don't know if this change is for worse or for better.
## 0.3.7 (11-10-2023)
Another jsx typing changes
## 0.3.6 (10-10-2023)
Now typescript will not give errors, when you pass your own attributes. Earlier that caused problems with SVGs.
## 0.3.4 (29-09-2023)
Works
