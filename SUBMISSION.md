# Design explanation

1. I built Dhoop, a rooftop-solar workspace for housing societies, because it connects to Sankar Group's clean-energy, fintech and AI work without being a generic SaaS idea.
2. The hero is a skyline you can drag through a day. The sun, sky colour, panel output, units generated and rupees saved all change together, so a visitor understands the product by touching it.
3. The palette comes from the product: solar-cell blue, silver busbar lines and noon yellow on a cool off-white page. The blue grid in the calculator section echoes a panel's cells.
4. Features are ledger-style rows with a sample reading on the right, like a utility bill, instead of a grid of identical cards. The how-it-works section is a timeline because it really is a sequence.
5. "Ask Dhoop" is a scripted AI assistant demo: it answers four sample questions about output, UPI dues and forecasts, draws a small chart, and lists the sources behind each answer. That connects the solar idea to Sankar Group's AI and fintech work.
6. The savings calculator turns the page into a tool: sliders recalculate plant size, payback and a 25-year chart live, with the assumptions stated openly.
7. Challenges: keeping the sun's whole path visible on narrow phones (the SVG is cropped, so JS computes the visible width), avoiding horizontal overflow, and making the form accessible (inline errors, focus on the first error, a focused success state).
8. Built with plain HTML, CSS and JavaScript so I can explain every line.
