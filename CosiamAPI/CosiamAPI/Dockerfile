#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["CosiamAPI/CosiamAPI.csproj", "CosiamAPI/"]
RUN dotnet restore "CosiamAPI/CosiamAPI.csproj"
COPY . .
WORKDIR "/src/CosiamAPI"
RUN dotnet build "CosiamAPI.csproj" -c Debug -o /app/build

FROM build AS publish
RUN dotnet publish "CosiamAPI.csproj" -c Debug -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CosiamAPI.dll"]