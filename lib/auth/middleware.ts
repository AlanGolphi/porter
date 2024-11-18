import { z } from 'zod'

export type ActionState<T = any> = {
  success: boolean
  error: string
  data?: T
}

export const createSuccessState = <T>(data: T) => ({
  success: true,
  data,
})

export const createErrorState = (error: string) => ({
  success: false,
  error,
})

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<T>

export const validatedAction =
  <S extends z.ZodType<any, any>, T>(schema: S, action: ValidatedActionFunction<S, T>) =>
  async (prevState: T, formData: FormData): Promise<T> => {
    const data = Object.fromEntries(formData.entries())
    const parsedData = schema.safeParse(data)

    if (!parsedData.success) {
      return createErrorState(parsedData.error.errors[0].message) as T
    }

    return action(parsedData.data, formData)
  }
