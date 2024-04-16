import numpy as np
from sympy import symbols, lambdify, exp

class EulerInput:
    def __init__(self, funcion, solucion_real_func, numPasos, x_inicial, y_inicial, rango_final, rango_inicial):
        self.funcion = funcion
        self.solucion_real_func = solucion_real_func
        self.numPasos = numPasos
        self.x_inicial = x_inicial
        self.y_inicial = y_inicial
        self.rango_final = rango_final
        self.rango_inicial = rango_inicial

def calculate_euler(input):
    x, y = symbols('x y')
    f = lambdify([x, y], input.funcion, modules=["numpy"])
    solucion_real_func = lambdify(x, input.solucion_real_func, modules=["numpy"])

    h = (input.rango_final - input.rango_inicial) / input.numPasos
    xs = np.linspace(input.rango_inicial, input.rango_final, input.numPasos + 1)
    ys = np.zeros(len(xs))
    ys[0] = input.y_inicial

    resultados = []
    for i in range(len(xs)):
        if i > 0:
            ys[i] = ys[i - 1] + h * f(xs[i - 1], ys[i - 1])
        valor_real = solucion_real_func(xs[i])
        error_absoluto = abs(valor_real - ys[i])
        error_relativo = error_absoluto / abs(valor_real) * 100 if valor_real != 0 else float('inf')

        resultados.append({
            "paso": i,
            "xn": float(xs[i]),
            "yn": float(ys[i]),
            "fxy": float(f(xs[i], ys[i])),  # correct calculation of fxy at current x and y
            "valorReal": float(valor_real),
            "errorAbsoluto": float(error_absoluto),
            "errorRelativo": float(error_relativo),
            "h": h
        })

    return resultados

# Ejemplo de uso:
input = EulerInput(funcion='2*x*y', solucion_real_func='exp(x**2 - 1)', numPasos=5, x_inicial=1.0, y_inicial=1.0, rango_final=1.5, rango_inicial=1.0)
resultados = calculate_euler(input)
for resultado in resultados:
    print(resultado)
