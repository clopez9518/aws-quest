namespace AwsQuest.Application.Common.Exceptions;

public class DuplicateEmailException : Exception
{
    public DuplicateEmailException(string email) 
        : base($"El correo electrónico '{email}' ya se encuentra registrado.")
    {
    }
}

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException() 
        : base("Las credenciales proporcionadas son incorrectas.")
    {
    }
}

public class UserNotFoundException : Exception
{
    public UserNotFoundException(Guid userId) 
        : base($"No se encontró el usuario con identificador '{userId}'.")
    {
    }
}
