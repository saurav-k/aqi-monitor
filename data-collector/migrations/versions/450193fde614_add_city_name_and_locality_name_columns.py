from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic.
revision = 'add_city_locality_columns'
down_revision = 'add_wind_rain_data'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to the weather_data table
    op.add_column('weather_data', sa.Column('city_name', sa.String(length=255), nullable=True), schema='aqi_data')
    op.add_column('weather_data', sa.Column('locality_name', sa.String(length=255), nullable=True), schema='aqi_data')

    # Optional: Backfill existing rows with default values if needed
    # You can modify the default values as per your requirement
    op.execute("""
        UPDATE aqi_data.weather_data
        SET city_name = 'Hyderabad', locality_name = 'Patancheru, Hyderabad'
        WHERE city_name IS NULL OR locality_name IS NULL
    """)

def downgrade():
    # Remove the added columns if rolling back the migration
    op.drop_column('weather_data', 'city_name', schema='aqi_data')
    op.drop_column('weather_data', 'locality_name', schema='aqi_data')
