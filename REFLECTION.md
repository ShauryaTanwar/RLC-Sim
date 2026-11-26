# Resonance Studio - Project Reflection

I wanted to create something that combined my interests in electrical engineering and software development. I decided to build Resonance Studio, an interactive circuit simulator that allows users to experiment with series RLC circuits and see how changing different component values affects the circuit. I wanted it to be more than just a calculator, so I focused on making the application interactive and including visualizations that help explain what is happening electrically.

One of the more challenging parts was getting the mathematical calculations and visualizations to work together correctly. Calculating resonance frequency, impedance, and phase was relatively straightforward, but making sure the oscilloscope and frequency-response graphs accurately reflected those calculations required more testing. I also had to consider how changes to resistance, inductance, and capacitance would affect the entire application.

I am particularly happy with the oscilloscope and frequency-response analyzer because they make it much easier to understand how a circuit behaves at different frequencies. Instead of just displaying a calculated resonance frequency, users can actually adjust the input frequency and watch the circuit approach resonance.

Another important part of the project was separating the frontend and backend. I used React for the interface and Python with FastAPI for the engineering calculations. This made the application easier to organize and allowed me to keep the mathematical implementation separate from the visual components.

If I had more time, I would like to add parallel RLC circuits and transient response simulations. Overall, this project was a good opportunity to apply concepts from my ECE coursework to a software application that other students could use to experiment with circuits.