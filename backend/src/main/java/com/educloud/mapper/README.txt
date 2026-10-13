// This package is intentionally empty.
//
// Entity -> DTO mapping in this codebase lives as small private
// `toResponse(...)` methods directly inside each Service class (e.g.
// AdminUserService.toResponse(Student)), rather than as separate
// standalone Mapper classes. For a project this size, colocating the
// mapping logic next to the service method that produces it made the
// code easier to follow — the mapping and the query/authorization logic
// that feeds it are usually only a few lines apart.
//
// If this project grows and the mapping logic gets reused across many
// services, promoting it into real classes here (e.g. StudentMapper,
// FacultyMapper) would be a reasonable refactor.
