from fastapi import FastAPI, HTTPException, Response
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
            xn=float(xs[i]),
            yn=float(ys[i]),
            fxy=float(f(xs[i], ys[i])),
            valorReal=float(valor_real),
            errorReal=float(error_real),
            errorRelativo=float(error_relativo),
            h=h
        ))

    return resultados

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
