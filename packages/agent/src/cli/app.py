"""
CLI Application: Typer-based Command-Line Interface

PURPOSE:
--------
Run agent from CLI without HTTP server.
Useful for local testing and automation.

DEPENDENCIES (ALLOWED):
-----------------------
- Typer
- usecases (to call directly)
- adapters (to instantiate locally)
- config (to read from CLI args or env)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO BFF imports

COMMANDS:
---------
- run: Run agent session end-to-end
- iterate: Run single iteration
- status: Check device/app status

TODO:
-----
- [ ] Implement Typer app
- [ ] Add run command
- [ ] Add iterate command
- [ ] Add status command
- [ ] Add config from CLI args
"""

# import typer

# app = typer.Typer()


# @app.command()
# def run(
#     app_id: str = typer.Option(..., help="Target app package"),
#     max_steps: int = typer.Option(50, help="Max iterations"),
# ):
#     """
#     Run agent session end-to-end.
    
#     TODO:
#     - [ ] Initialize adapters
#     - [ ] Create initial state
#     - [ ] Loop: iterate_once until stop
#     - [ ] Finalize and print summary
#     """
#     pass


# @app.command()
# def iterate(
#     session_id: str = typer.Option(..., help="Session ID"),
# ):
#     """
#     Run single iteration.
    
#     TODO:
#     - [ ] Load state
#     - [ ] Call iterate_once
#     - [ ] Persist updated state
#     - [ ] Print result
#     """
#     pass


# @app.command()
# def status():
#     """
#     Check device/app status.
    
#     TODO:
#     - [ ] Check device connectivity
#     - [ ] Check app installation
#     - [ ] Print status
#     """
#     pass


# if __name__ == "__main__":
#     app()

# Placeholder for CLI app
# This file contains only comments and stubs

