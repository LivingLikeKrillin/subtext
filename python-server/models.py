from pydantic import BaseModel


class InferenceRequest(BaseModel):
    input_text: str


class InferenceResponse(BaseModel):
    job_id: str
