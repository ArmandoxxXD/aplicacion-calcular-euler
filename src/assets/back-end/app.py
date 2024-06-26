from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sympy import SympifyError, symbols, lambdify, sympify
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EulerInput(BaseModel):
    funcion: str
    solucion_real_func: str
    numPasos: int
    x_inicial: float
    y_inicial: float
    rango_final: float
    rango_inicial: float

class EulerOutput(BaseModel):
    paso: int
    xn: float
    yn: float
    fxy: float
    valorReal: float
    errorReal: float
    errorRelativo: float
    h: float

class EulerMejoradoOutput(BaseModel):
    paso: int
    xn: float
    yn: float
    fxy: float
    deltaY: float
    xnMas1: float
    ynMas1: float
    fXnYn: float
    hSFuncion: float
    valorReal: float
    errorReal: float
    errorRelativo: float
    h: float

def replace_operators(input_string):
    """
    Reemplaza operadores matemáticos en una cadena de entrada para que sean compatibles con Sympy.
    """
    return input_string.replace('^', '**').replace('e', 'exp')

@app.post("/euler", response_model=List[EulerOutput])
async def calculate_euler(input: EulerInput):
    try:
        input.funcion = replace_operators(input.funcion)
        input.solucion_real_func = replace_operators(input.solucion_real_func)

        x, y = symbols('x y')
        f = lambdify([x, y], sympify(input.funcion), modules=["numpy"])
        solucion_real_func = lambdify(x, sympify(input.solucion_real_func), modules=["numpy"])
    except (SympifyError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Error al procesar las expresiones matemáticas: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

    h = (input.rango_final - input.rango_inicial) / input.numPasos
    xs = np.linspace(input.rango_inicial, input.rango_final, input.numPasos + 1)
    ys = np.zeros(len(xs))
    ys[0] = input.y_inicial

    resultados = []
    for i in range(len(xs)):
        if i > 0:
            ys[i] = ys[i - 1] + h * f(xs[i - 1], ys[i - 1])
        valor_real = solucion_real_func(xs[i])
        error_real = abs(valor_real - ys[i])
        error_relativo = error_real / abs(valor_real) * 100 if valor_real != 0 else float('inf')

        resultados.append(EulerOutput(
            paso=i,
            xn=round(float(xs[i]),5),
            yn=round(float(ys[i]),5),
            fxy=round(float(f(xs[i], ys[i])),5),
            valorReal=round(float(valor_real),5),
            errorReal=round(float(error_real),5),
            errorRelativo=round(float(error_relativo),5),
            h=round(h, 5)
        ))

    return resultados

@app.post("/euler-mejorado", response_model=List[EulerMejoradoOutput])
async def calculate_euler_mejorado(input: EulerInput):
    try:
        input.funcion = replace_operators(input.funcion)
        input.solucion_real_func = replace_operators(input.solucion_real_func)
        
        x, y = symbols('x y')
        f = lambdify([x, y], sympify(input.funcion), modules=["numpy"])
        real_func = lambdify(x, sympify(input.solucion_real_func), modules=["numpy"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar las expresiones matemáticas: {str(e)}")

    h = (input.rango_final - input.rango_inicial) / input.numPasos
    xs = np.linspace(input.rango_inicial, input.rango_final, input.numPasos + 1)
    ys = np.zeros(len(xs))
    ys[0] = input.y_inicial

    resultados = []

    for i in range(input.numPasos + 1):
        fxy = f(xs[i], ys[i])
        deltaY = h * fxy
        
        # Usar Euler estándar para calcular ynMas1
        ynMas1 = ys[i] + deltaY

        # Si se necesita calcular fXnYn para otros cálculos, usamos ynMas1
        if i < input.numPasos:
            fXnYn = f(xs[i] + h, ynMas1)
            xs[i + 1] = xs[i] + h
            # Actualizar ys[i+1] con la corrección de Euler Mejorado si se desea
            ys[i + 1] = ys[i] + h * (fxy + fXnYn) / 2
        else:
            fXnYn = 0  # Para el último paso, no hay un siguiente valor para calcular
        valor_real = real_func(xs[i])
        # El error absoluto se calcula como la diferencia entre el valor real y yn, no ynMas1
        error_absoluto = abs(valor_real - ys[i])
        # El error relativo es el error absoluto dividido por el valor real, multiplicado por 100
        error_relativo = (error_absoluto / abs(valor_real)) * 100 if valor_real != 0 else float('inf')

        resultados.append(EulerMejoradoOutput(
            paso=i,
            xn=round(float(xs[i]), 5),
            yn=round(float(ys[i]), 5),
            fxy=round(float(fxy), 5),
            deltaY=round(float(deltaY), 5),
            xnMas1=round(float(xs[i] + h), 5),
            ynMas1=round(float(ynMas1), 5),
            fXnYn=round(float(fXnYn), 5),
            hSFuncion=round(float(h * (fxy + fXnYn) / 2) if i < input.numPasos else 0, 5),
            valorReal=round(valor_real, 5),
            errorReal=round(error_absoluto, 5),
            errorRelativo=round(error_relativo, 5),
            h=round(h, 5)
        ))

    return resultados

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
