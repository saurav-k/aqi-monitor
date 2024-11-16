"""create zphs01b sensor table

Revision ID: 2399db5b91e8
Revises: 93e7a38b9b0b
Create Date: 2024-11-07 04:20:49.576975

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2399db5b91e8'
down_revision: Union[str, None] = '93e7a38b9b0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create the zphs01b_readings table
    op.create_table(
        'zphs01b_readings',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('timestamp', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('pm1_0', sa.Float, nullable=False),  # PM1.0 concentration in µg/m³
        sa.Column('pm2_5', sa.Float, nullable=False),  # PM2.5 concentration in µg/m³
        sa.Column('pm10', sa.Float, nullable=False),  # PM10 concentration in µg/m³
        sa.Column('co2', sa.Float, nullable=False),  # CO2 concentration in ppm
        sa.Column('voc', sa.Integer, nullable=False),  # VOC level (0 to 3 grade)
        sa.Column('temperature', sa.Float, nullable=False),  # Temperature in °C
        sa.Column('humidity', sa.Float, nullable=False),  # Humidity in %RH
        sa.Column('ch2o', sa.Float, nullable=False),  # CH2O concentration in mg/m³
        sa.Column('co', sa.Float, nullable=False),  # CO concentration in ppm
        sa.Column('o3', sa.Float, nullable=False),  # O3 concentration in ppm
        sa.Column('no2', sa.Float, nullable=False),  # NO2 concentration in ppm
        # Inferred AQI values
        sa.Column('aqi_pm2_5', sa.Integer, nullable=False),  # Inferred AQI for PM2.5
        sa.Column('aqi_pm10', sa.Integer, nullable=False),  # Inferred AQI for PM10
        sa.Column('aqi_co', sa.Integer, nullable=True),  # Inferred AQI for CO (if applicable)
        sa.Column('aqi_o3', sa.Integer, nullable=True),  # Inferred AQI for O3 (if applicable)
        sa.Column('aqi_no2', sa.Integer, nullable=True),  # Inferred AQI for NO2 (if applicable)
        sa.Column('overall_aqi', sa.Integer, nullable=False),  # Overall AQI
        schema='aqi_data'
    )

def downgrade():
    # Drop the zphs01b_readings table
    op.drop_table('zphs01b_readings', schema='aqi_data')
