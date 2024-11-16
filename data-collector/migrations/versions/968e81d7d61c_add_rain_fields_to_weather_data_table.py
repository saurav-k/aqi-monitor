from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic.
revision = 'add_wind_rain_data'
down_revision = '2399db5b91e8'
branch_labels = None
depends_on = None

def upgrade():
    # Create the weather_data table with all required fields
    op.create_table(
        'weather_data',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('timestamp', sa.DateTime, nullable=False),
        sa.Column('temperature', sa.Float, nullable=True),
        sa.Column('humidity', sa.Float, nullable=True),
        sa.Column('wind_speed', sa.Float, nullable=True),
        sa.Column('wind_direction', sa.Float, nullable=True),
        sa.Column('rain_intensity', sa.Float, nullable=True),
        sa.Column('rain_accumulation', sa.Float, nullable=True),
        schema='aqi_data'
    )

def downgrade():
    # Drop the weather_data table if rolling back the migration
    op.drop_table('weather_data')
