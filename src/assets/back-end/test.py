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






## Codigo desfazado pero con lsod atos bien 
    
# @app.post("/euler-mejorado", response_model=List[EulerMejoradoOutput])
# async def calculate_euler_mejorado(input: EulerInput):
#     try:
#         input.funcion = replace_operators(input.funcion)
#         input.solucion_real_func = replace_operators(input.solucion_real_func)

#         x, y = symbols('x y')
#         f = lambdify([x, y], sympify(input.funcion), modules=["numpy"])
#         solucion_real_func = lambdify(x, sympify(input.solucion_real_func), modules=["numpy"])
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error al procesar las expresiones matemáticas: {str(e)}")

#     h = (input.rango_final - input.rango_inicial) / input.numPasos
#     xs = np.linspace(input.rango_inicial, input.rango_final, input.numPasos + 1)
#     ys = np.zeros(len(xs))
#     ys[0] = input.y_inicial

#     resultados = [EulerMejoradoOutput(
#         paso=0,
#         xn=float(xs[0]),
#         yn=float(ys[0]),
#         fxy=float(f(xs[0], ys[0])),
#         deltaY=0.0,
#         xnMas1=float(xs[0]),
#         ynMas1=float(ys[0]),
#         fXnYn=float(f(xs[0], ys[0])),
#         hSFuncion=0.0,
#         valorReal=float(solucion_real_func(xs[0])),
#         errorReal=0.0,
#         errorRelativo=0.0,
#         h=h
#     )]

#     for i in range(input.numPasos):
#         fxy = f(xs[i], ys[i])
#         predictor = ys[i] + h * fxy
#         fXnYn = f(xs[i + 1], predictor)
#         ynMas1 = ys[i] + h * (fxy + fXnYn) / 2
#         ys[i + 1] = ynMas1

#         valor_real = solucion_real_func(xs[i + 1])
#         error_absoluto = abs(valor_real - ynMas1)
#         error_relativo = error_absoluto / abs(valor_real) * 100 if valor_real != 0 else float('inf')

#         resultados.append(EulerMejoradoOutput(
#             paso=i + 1,
#             xn=float(xs[i + 1]),
#             yn=float(ys[i + 1]),
#             fxy=float(fxy),
#             deltaY=float(fxy* h),
#             xnMas1=float(xs[i + 1]),
#             ynMas1=float(ynMas1),
#             fXnYn=float(fXnYn),
#             hSFuncion=float(h * (fxy+fXnYn)/2),
#             valorReal=float(valor_real),
#             errorReal=float(error_absoluto),
#             errorRelativo=float(error_relativo),
#             h=h
#         ))

#     return resultados

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)